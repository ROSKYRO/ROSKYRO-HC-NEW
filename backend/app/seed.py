"""
Run on every boot to populate/keep the database in sync with:
- An admin login (credentials come from ADMIN_SEED_PHONE / ADMIN_SEED_PASSWORD)
- A first live city + a couple of waitlisted cities
- Optionally (SEED_DEMO_DATA=true, never in production) a demo partner
  hospital so the Patient Concierge Program is clickable right after deploy

Usage:  python -m app.seed

SECURITY NOTE: this file used to hard-code a well-known admin login
(9999999999 / admin123) and a demo Hospital Console login
(9999999997 / hospital123), created automatically on every fresh deploy.
Because those values live in the repository, anyone who had seen the code
could log into a live ROSKYRO install as an administrator. They are gone:
the admin account is now only ever created from ADMIN_SEED_PHONE /
ADMIN_SEED_PASSWORD, and the demo hospital is opt-in.
"""
import logging
import secrets
from datetime import date

from app.db.session import SessionLocal, engine, Base
from app.models.city import City
from app.models.user import User, UserRole
from app.models.hospital import Hospital, HospitalContractStatus
from app.models.patient_case import PatientCase
from app.models.doctor import Doctor
from app.core.security import hash_password
from app.core.config import settings

logger = logging.getLogger("roskyro.seed")

Base.metadata.create_all(bind=engine)


def _seed_cities(db) -> None:
    if not db.query(City).first():
        db.add_all([
            City(name="Ambikapur", state="Chhattisgarh", is_live=True),
            City(name="Ranchi", state="Jharkhand", is_live=False),
            City(name="Lucknow", state="Uttar Pradesh", is_live=False),
        ])


def _seed_admin(db) -> None:
    """Create the first admin account, once, from configuration only."""
    if db.query(User).filter(User.role == UserRole.admin).first():
        return

    phone = settings.ADMIN_SEED_PHONE or settings.ADMIN_RESET_PHONE
    password = settings.ADMIN_SEED_PASSWORD or settings.ADMIN_RESET_PASSWORD

    if not (phone and password):
        if settings.is_production:
            # validate_for_boot() already blocks this combination, so reaching
            # here means the check was bypassed — still refuse to create a
            # guessable admin rather than silently doing it.
            logger.error(
                "No admin account exists and ADMIN_SEED_PHONE / ADMIN_SEED_PASSWORD "
                "are not set. Set them and redeploy — no admin was created."
            )
            return
        # Local/dev convenience: a RANDOM password, printed once to the log,
        # instead of a constant that is identical on every install.
        phone = phone or "9999999999"
        password = secrets.token_urlsafe(12)
        logger.warning(
            "DEV SEED: created admin phone=%s password=%s "
            "(random, shown once — set ADMIN_SEED_PHONE/ADMIN_SEED_PASSWORD to control it)",
            phone, password,
        )

    if db.query(User).filter(User.phone == phone).first():
        logger.warning("Admin seed skipped: phone %s already belongs to another account.", phone)
        return

    db.add(User(
        full_name="ROSKYRO Admin",
        phone=phone,
        email=None,
        hashed_password=hash_password(password),
        role=UserRole.admin,
    ))


def _seed_demo_hospital(db) -> None:
    """Opt-in only (SEED_DEMO_DATA=true) and never in production: a demo
    hospital plus a Hospital Console login, so a local walkthrough has
    something to click. The password is random per install."""
    if not settings.SEED_DEMO_DATA or settings.is_production:
        return
    if db.query(Hospital).first():
        return

    live_city = db.query(City).filter(City.is_live.is_(True)).first()
    demo_hospital = Hospital(
        name="Ambikapur Multispeciality Hospital (Demo)",
        city_id=live_city.id if live_city else None,
        contact_name="Front Desk",
        contact_phone="9999999998",
        contract_status=HospitalContractStatus.active,
        per_patient_daily_rate=499.0,
        notes="Demo hospital — delete before going live (Admin > Hospitals).",
    )
    db.add(demo_hospital)
    db.flush()  # get demo_hospital.id before using it below

    demo_password = secrets.token_urlsafe(10)
    db.add(User(
        full_name="Demo Hospital Desk",
        phone="9999999997",
        hashed_password=hash_password(demo_password),
        role=UserRole.hospital_staff,
        hospital_id=demo_hospital.id,
    ))
    db.add(PatientCase(
        hospital_id=demo_hospital.id,
        patient_name="Demo Patient",
        attendant_phone="9999999996",
        short_note="Sample case — assign a Relationship Officer from Admin > Hospitals.",
        admission_date=date.today(),
        daily_rate=demo_hospital.per_patient_daily_rate,
    ))
    logger.warning(
        "DEV SEED: demo Hospital Console login phone=9999999997 password=%s", demo_password
    )


def _seed_demo_doctor(db) -> None:
    """Opt-in only (SEED_DEMO_DATA=true) and never in production: one
    concierge doctor so the Doctor + Healthcare Concierge Membership has
    someone to assign on a local walkthrough."""
    if not settings.SEED_DEMO_DATA or settings.is_production:
        return
    if db.query(Doctor).first():
        return
    db.add(Doctor(
        full_name="Anjali Mehta",
        specialty="Internal Medicine",
        qualification="MBBS, MD",
        contact_phone="9999999995",
        bio="Demo concierge doctor — assign or reassign from Admin > Doctors.",
        max_members=40,
    ))


def _apply_admin_reset(db) -> None:
    """One-time reset hook: when ADMIN_RESET_PHONE / ADMIN_RESET_PASSWORD are
    set, overwrite the existing admin's credentials on boot. Set them, deploy,
    log in, then REMOVE the variables — otherwise every future boot keeps
    re-applying (and thereby re-exposing) the same password."""
    if not (settings.ADMIN_RESET_PHONE or settings.ADMIN_RESET_PASSWORD):
        return
    admin = db.query(User).filter(User.role == UserRole.admin).first()
    if not admin:
        return
    if settings.ADMIN_RESET_PHONE:
        clash = db.query(User).filter(
            User.phone == settings.ADMIN_RESET_PHONE, User.id != admin.id
        ).first()
        if clash:
            logger.error("ADMIN_RESET_PHONE is already used by another account — reset skipped.")
            return
        admin.phone = settings.ADMIN_RESET_PHONE
    if settings.ADMIN_RESET_PASSWORD:
        admin.hashed_password = hash_password(settings.ADMIN_RESET_PASSWORD)
    db.commit()
    logger.warning(
        "Admin credentials reset from ADMIN_RESET_* — remove those variables now "
        "so they are not re-applied on every boot."
    )


def run():
    db = SessionLocal()
    try:
        _seed_cities(db)
        _seed_admin(db)
        _seed_demo_hospital(db)
        _seed_demo_doctor(db)
        db.commit()
        _apply_admin_reset(db)
        logger.info("Seed complete.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run()
