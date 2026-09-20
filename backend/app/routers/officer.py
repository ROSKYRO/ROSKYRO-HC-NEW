from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.agent import Agent
from app.models.patient_case import PatientCase, PatientCaseStatus
from app.schemas.officer import (
    OfficerPatientCaseOut, OfficerDischargeIn, OfficerDischargeOut,
    OfficerPortalOut, OfficerPortalCaseOut,
)
from app.services.patient_billing import (
    apply_officer_discharge_confirmation, undo_officer_discharge_confirmation,
    officer_discharge_link_is_live, discharge_waiting_on, DischargeValidationError,
    officer_on_duty, notify_hospital_of_discharge,
)
from app.services.officer_roster import portal_token_is_live

router = APIRouter(prefix="/officer", tags=["officer"])

_MAX_PHOTO_URL_LENGTH = 2000


def _validate_photo_url(photo_url: str) -> str:
    url = (photo_url or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="Please paste the Google Drive link to the discharge photo.")
    if len(url) > _MAX_PHOTO_URL_LENGTH:
        raise HTTPException(status_code=400, detail="That link looks wrong — please paste the Google Drive share link.")
    if not (url.lower().startswith("http://") or url.lower().startswith("https://")):
        raise HTTPException(status_code=400, detail="Please paste a valid link (starting with https://) to the photo on Google Drive.")
    return url


# ---------------------------------------------------------------------------
# Hospital patient-case discharge — the assigned Relationship Officer's side
# of the dual discharge confirmation. The officer has no Console/User login
# in this build, so a long random, single-purpose link
# (PatientCase.officer_discharge_token, handed out from the ROSKYRO Admin
# ops board) stands in for one — the token itself IS the authentication.
# ---------------------------------------------------------------------------

def _get_case_by_discharge_token(db: Session, token: str) -> PatientCase:
    """The token IS the authentication, and we never reveal *why* it failed.
    These links have an expiry (PatientCase.officer_discharge_token_expires_at)
    — an expired one is treated exactly like one that never existed, so a
    link that ends up in the wrong hands stops being a way for a stranger to
    close someone's discharge. Admin can mint a fresh one at any time, which
    also instantly kills the previous link."""
    case = db.query(PatientCase).filter(PatientCase.officer_discharge_token == token).first()
    if not case or not officer_discharge_link_is_live(case):
        raise HTTPException(status_code=404, detail="This link is invalid or has expired.")
    return case


@router.get("/discharge/{token}", response_model=OfficerPatientCaseOut)
def get_officer_discharge_case(token: str, db: Session = Depends(get_db)):
    case = _get_case_by_discharge_token(db, token)
    return OfficerPatientCaseOut(
        patient_name=case.patient_name,
        hospital_name=case.hospital.name if case.hospital else None,
        admission_date=case.admission_date,
        status=case.status,
        hospital_discharge_at=case.hospital_discharge_at,
        officer_discharge_at=case.officer_discharge_at,
        waiting_on=discharge_waiting_on(case),
        link_expires_at=case.officer_discharge_token_expires_at,
    )


@router.post("/discharge/{token}", response_model=OfficerDischargeOut)
def confirm_officer_discharge(token: str, payload: OfficerDischargeIn, db: Session = Depends(get_db)):
    """The assigned officer confirms the date & time the patient was
    actually discharged, with a timestamped photo as proof — this ALONE
    closes the case (stops billing). The Hospital Console has no confirm
    action any more; instead, the moment this closes the case, the
    hospital's registered contact is notified and given a window to dispute
    if it's wrong (see patient_billing.notify_hospital_of_discharge)."""
    case = _get_case_by_discharge_token(db, token)
    if case.status == PatientCaseStatus.discharged:
        raise HTTPException(status_code=400, detail="This case is already fully discharged.")
    if case.status == PatientCaseStatus.cancelled:
        raise HTTPException(status_code=400, detail="This case was cancelled — there's nothing to discharge.")

    photo_url = _validate_photo_url(payload.photo_url)
    try:
        apply_officer_discharge_confirmation(
            case, payload.discharge_datetime, photo_url=photo_url, lat=payload.lat, lng=payload.lng,
        )
    except DischargeValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if case.status == PatientCaseStatus.discharged:
        notify_hospital_of_discharge(db, case)

    db.commit()
    return OfficerDischargeOut(
        status=case.status,
        message="Discharge confirmed and this case is now fully closed. The hospital has been notified.",
    )


@router.delete("/discharge/{token}", response_model=OfficerDischargeOut)
def undo_officer_discharge(token: str, db: Session = Depends(get_db)):
    """The officer takes back a confirmation given by mistake — the mirror of
    the hospital's undo. Only possible while the case hasn't fully closed;
    after that it's an Admin decision."""
    case = _get_case_by_discharge_token(db, token)
    if not case.officer_discharge_at:
        raise HTTPException(status_code=400, detail="You haven't confirmed a discharge for this patient yet.")
    try:
        undo_officer_discharge_confirmation(case)
    except DischargeValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    db.commit()
    return OfficerDischargeOut(
        status=case.status,
        message="Your discharge confirmation has been withdrawn. Confirm again once you have the right date & time.",
    )


# ---------------------------------------------------------------------------
# The officer's own no-login "my day" portal — everything this officer is
# covering right now, across every hospital, in one place. This link is
# standing (not tied to one patient) and issued from the Officers roster on
# the Admin ops board.
# ---------------------------------------------------------------------------

@router.get("/portal/{token}", response_model=OfficerPortalOut)
def get_officer_portal(token: str, db: Session = Depends(get_db)):
    """Same no-login, token-is-the-auth pattern as every other officer link
    in this file — never reveal *why* a token failed, just 404."""
    agent = db.query(Agent).filter(Agent.portal_token == token).first()
    if not agent or not portal_token_is_live(agent):
        raise HTTPException(status_code=404, detail="This link is invalid or has expired.")

    today = datetime.utcnow().date()
    from sqlalchemy import or_
    from sqlalchemy.orm import joinedload
    from app.models.patient_case import DailyOfficerAssignment

    open_cases = db.query(PatientCase).options(
        joinedload(PatientCase.hospital),
        joinedload(PatientCase.assignments).joinedload(DailyOfficerAssignment.agent),
    ).filter(
        PatientCase.status.in_([PatientCaseStatus.active, PatientCaseStatus.pending_discharge]),
        or_(
            PatientCase.assigned_agent_id == agent.id,
            PatientCase.assignments.any(DailyOfficerAssignment.agent_id == agent.id),
        ),
    ).order_by(PatientCase.admission_date).all()

    cases_out = []
    today_count = 0
    for c in open_cases:
        on_duty = officer_on_duty(c, today)
        covering_today = on_duty.agent_id == agent.id
        if covering_today:
            today_count += 1
        cases_out.append(OfficerPortalCaseOut(
            patient_name=c.patient_name,
            hospital_name=c.hospital.name if c.hospital else None,
            ward_or_room=c.ward_or_room,
            admission_date=c.admission_date,
            status=c.status,
            covering_today=covering_today,
            hospital_discharge_at=c.hospital_discharge_at,
            officer_discharge_at=c.officer_discharge_at,
            discharge_link_token=c.officer_discharge_token if c.assigned_agent_id == agent.id else None,
        ))

    return OfficerPortalOut(full_name=agent.full_name, today_patient_count=today_count, cases=cases_out)
