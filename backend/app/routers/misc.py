from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.complaint import Complaint, ComplaintCategory
from app.models.city import City
from app.schemas.misc import ComplaintIn, CityInterestIn, CityOut
from app.core.limiter import limiter
from app.core.config import settings

router = APIRouter(tags=["misc"])


@router.post("/complaints")
@limiter.limit(settings.PUBLIC_FORM_RATE_LIMIT)
def submit_complaint(request: Request, payload: ComplaintIn, db: Session = Depends(get_db)):
    """Rate-limited: an unauthenticated write endpoint with no limit let a
    single script flood the admin complaints queue."""
    complaint = Complaint(
        name=payload.name,
        phone=payload.phone,
        booking_code=payload.booking_code,
        category=payload.category,
        message=payload.message,
        is_priority=(payload.category == ComplaintCategory.safety),
    )
    db.add(complaint)
    db.commit()
    return {"detail": "Received — our team will reach out shortly.", "priority": complaint.is_priority}


@router.get("/cities", response_model=List[CityOut])
def list_cities(db: Session = Depends(get_db)):
    return db.query(City).all()


@router.post("/cities/interest")
@limiter.limit(settings.PUBLIC_FORM_RATE_LIMIT)
def register_city_interest(request: Request, payload: CityInterestIn, db: Session = Depends(get_db)):
    # escape LIKE wildcards: a city_name of "%" would otherwise match the
    # first existing city and bump ITS interest counter.
    name = payload.city_name.strip()
    escaped = name.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    city = db.query(City).filter(City.name.ilike(escaped, escape="\\")).first()
    if not city:
        city = City(name=name, is_live=False)
        db.add(city)
        db.flush()
    city.interest_count += 1
    db.commit()
    return {"detail": f"Thanks — we'll factor {city.name} into where we launch next."}
