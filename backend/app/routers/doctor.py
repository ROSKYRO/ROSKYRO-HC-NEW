from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.doctor import Doctor
from app.models.membership import (
    Membership, MembershipStatus, CareRequest, CareRequestCategory,
    CareRequestOrigin, CareRequestStatus, DoctorConsultation,
)
from app.schemas.doctor import (
    DoctorPortalOut, DoctorPortalMemberOut, DoctorLogConsultationIn, DoctorConsultationOut,
    DoctorLogReferralIn,
)
from app.services.doctor_roster import portal_token_is_live
from app.services.membership_quota import doctor_consultation_quota_status

router = APIRouter(prefix="/doctor", tags=["doctor"])


# ---------------------------------------------------------------------------
# The concierge doctor's own no-login portal — same token-is-the-auth
# pattern as routers/officer.py's "my day" link, just scoped to a Doctor
# instead of an Agent. Issued/rotated from the admin Doctors tab
# (POST /admin/doctors/{id}/portal-link). Lets a doctor who has no
# Console/User login in this build see who's assigned to them and log a
# consultation or a referral themselves, instead of everything having to
# go through the concierge desk on their behalf (the AdminDoctorReferralIn /
# AdminLogConsultationIn endpoints in routers/admin.py still exist for
# exactly that phone/WhatsApp-reported case).
# ---------------------------------------------------------------------------

def _get_doctor_by_token(db: Session, token: str) -> Doctor:
    """The token IS the authentication, and we never reveal *why* it
    failed — an expired or unknown token both just 404, same as every other
    no-login link in this app."""
    doctor = db.query(Doctor).filter(Doctor.portal_token == token).first()
    if not doctor or not portal_token_is_live(doctor):
        raise HTTPException(status_code=404, detail="This link is invalid or has expired.")
    return doctor


def _assigned_memberships(db: Session, doctor_id: int):
    """Every membership currently pointing at this doctor, regardless of
    plan (assigning a doctor isn't hard-restricted to the doctor_concierge
    plan — see Membership.assigned_doctor_id) — but only ones the doctor
    should actually see: pending/active/paused, never a cancelled/expired
    member who's no longer their patient."""
    return db.query(Membership).filter(
        Membership.assigned_doctor_id == doctor_id,
        Membership.status.in_([MembershipStatus.pending, MembershipStatus.active, MembershipStatus.paused]),
    ).order_by(Membership.started_at.desc()).all()


@router.get("/portal/{token}", response_model=DoctorPortalOut)
def get_doctor_portal(token: str, db: Session = Depends(get_db)):
    doctor = _get_doctor_by_token(db, token)
    memberships = _assigned_memberships(db, doctor.id)

    members_out = []
    for m in memberships:
        quota = doctor_consultation_quota_status(m, db)
        open_count = db.query(CareRequest).filter(
            CareRequest.membership_id == m.id,
            CareRequest.status.in_([CareRequestStatus.open, CareRequestStatus.in_progress]),
        ).count()
        members_out.append(DoctorPortalMemberOut(
            membership_id=m.id,
            member_code=m.member_code,
            customer_name=m.user.full_name,
            customer_phone=m.user.phone,
            plan=m.plan.value,
            consultations_quota=quota["quota"],
            consultations_used=quota["used"],
            consultations_remaining=quota["remaining"],
            consultations_unlimited=quota["unlimited"],
            open_care_request_count=open_count,
        ))

    return DoctorPortalOut(
        full_name=doctor.full_name,
        specialty=doctor.specialty,
        assigned_member_count=len(members_out),
        members=members_out,
    )


def _member_of_doctor(db: Session, doctor: Doctor, membership_id: int) -> Membership:
    """A doctor can only act on a member currently assigned to them — never
    reveal whether the membership exists at all if it isn't theirs, same
    404-only-and-no-detail-leak posture as _get_doctor_by_token above."""
    membership = db.query(Membership).filter(
        Membership.id == membership_id, Membership.assigned_doctor_id == doctor.id,
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="This member isn't assigned to you.")
    return membership


@router.post("/portal/{token}/consultations", response_model=DoctorConsultationOut)
def log_consultation(token: str, payload: DoctorLogConsultationIn, db: Session = Depends(get_db)):
    """The doctor logs a consultation with one of their own assigned
    members — counts against that member's annual doctor_concierge
    allowance (see models.membership.DoctorConsultation)."""
    doctor = _get_doctor_by_token(db, token)
    membership = _member_of_doctor(db, doctor, payload.membership_id)

    consultation = DoctorConsultation(
        membership_id=membership.id,
        doctor_id=doctor.id,
        occurred_at=payload.occurred_at or datetime.utcnow(),
        note=payload.note,
        logged_by="doctor_portal",
    )
    db.add(consultation)
    db.commit()

    quota = doctor_consultation_quota_status(membership, db)
    return DoctorConsultationOut(
        detail="Consultation logged.",
        consultations_used=quota["used"],
        consultations_quota=quota["quota"],
        consultations_remaining=quota["remaining"],
        consultations_unlimited=quota["unlimited"],
    )


@router.post("/portal/{token}/referrals")
def log_referral(token: str, payload: DoctorLogReferralIn, db: Session = Depends(get_db)):
    """The doctor refers a member onward for coordination — the same
    origin=doctor_referral CareRequest the concierge desk would otherwise
    log on their behalf (AdminDoctorReferralIn), just self-serve."""
    doctor = _get_doctor_by_token(db, token)
    membership = _member_of_doctor(db, doctor, payload.membership_id)

    try:
        parsed_category = CareRequestCategory(payload.category)
    except ValueError:
        parsed_category = CareRequestCategory.other

    req = CareRequest(
        membership_id=membership.id,
        family_member_id=payload.family_member_id,
        category=parsed_category,
        origin=CareRequestOrigin.doctor_referral,
        title=payload.title,
        description=payload.description,
        status=CareRequestStatus.open,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return {
        "id": req.id, "membership_id": req.membership_id, "category": req.category.value,
        "origin": req.origin.value, "title": req.title, "status": req.status.value,
    }
