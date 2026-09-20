from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import SignupIn, LoginIn, TokenOut
from app.core.security import hash_password, verify_password, create_access_token
from app.core.limiter import limiter
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenOut)
@limiter.limit(settings.SIGNUP_RATE_LIMIT)
def signup(request: Request, payload: SignupIn, db: Session = Depends(get_db)):
    """Rate-limited: this endpoint creates a database row for anyone on the
    internet, and previously had no limit at all."""
    phone = payload.phone.strip()
    # An empty-string email would collide on the UNIQUE index with the next
    # signup that also left it blank, so blanks are stored as NULL.
    email = (payload.email or "").strip() or None

    if db.query(User).filter(User.phone == phone).first():
        raise HTTPException(status_code=400, detail="An account with this phone number already exists")
    if email and db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="An account with this email address already exists")

    user = User(
        full_name=payload.full_name.strip(),
        phone=phone,
        email=email,
        hashed_password=hash_password(payload.password),
        preferred_language=payload.preferred_language,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # Two signups racing on the same phone/email land here. Without this
        # the customer saw a bare 500 instead of being told the account exists.
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="An account with this phone number or email already exists",
        )
    db.refresh(user)

    token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenOut(access_token=token, role=user.role.value, user_id=user.id, full_name=user.full_name)


@router.post("/login", response_model=TokenOut)
@limiter.limit(settings.LOGIN_RATE_LIMIT)
def login(request: Request, payload: LoginIn, db: Session = Depends(get_db)):
    """Customer-facing login only. Admin/support accounts cannot authenticate
    here — they must use the separate /admin/auth/login endpoint, which is not
    linked anywhere on the public site. This keeps the two attack surfaces
    (and their rate limits/session lengths) fully separate: someone hammering
    this endpoint can never learn whether a given phone number is an admin
    account, because the response for a valid admin phone + wrong context is
    identical to "wrong number".
    """
    user = db.query(User).filter(User.phone == payload.phone.strip()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    if user.role in (UserRole.admin, UserRole.support):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    # A deactivated customer could still log in and get a token that
    # get_current_user then rejected on every request — a confusing dead end.
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenOut(access_token=token, role=user.role.value, user_id=user.id, full_name=user.full_name)
