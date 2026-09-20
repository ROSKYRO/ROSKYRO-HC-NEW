from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.db.session import get_db
from app.core.deps import require_hospital_staff
from app.core.security import verify_password, create_access_token
from app.core.limiter import limiter
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.hospital import Hospital
from app.models.patient_case import PatientCase, PatientCaseStatus, DailyOfficerAssignment
from app.models.hospital_invoice import HospitalInvoice, HospitalInvoiceStatus
from app.schemas.auth import LoginIn, TokenOut
from app.schemas.hospital import (
    PublicHospitalOut, PatientCaseOut,
    DailyAssignmentOut, HospitalDashboardOut, HospitalDisputeIn, CaseAlertOut,
)
from app.schemas.hospital_invoice import HospitalInvoiceOut, ReportInvoicePaymentIn
from app.models.patient_case import DailyAssignmentStatus
from app.services.patient_billing import (
    coverage_days_and_billing, officer_on_duty, build_case_alerts,
    requires_officer_confirmation, discharge_waiting_on, discharge_pending_since,
    hospital_dispute_window_open, apply_hospital_dispute, DischargeValidationError,
)

# Public router: hospital picker shown to families during booking.
public_router = APIRouter(prefix="/hospitals", tags=["hospitals"])

# Console router: everything a logged-in Hospital Console user can do.
# Kept under its own prefix + its own login endpoint (mirrors /admin/auth/login)
# so hospital sessions are fully isolated from both customer and admin auth.
#
# IMPORTANT — this router is intentionally VIEW + PAY ONLY. The hospital has
# no operational role in the Concierge Program at all: ROSKYRO (Admin/ops,
# via app/routers/hospital_admin.py) opens every patient case after being
# handed a few details verbally, and the assigned Relationship Officer alone
# confirms discharge (app/routers/officer.py, with a photo as proof). The
# hospital's only two actions here are (1) disputing a discharge it thinks
# is wrong, within a short window, and (2) declaring a payment it has made
# by cheque/netbanking/UPI/cash — both of those are the hospital reacting to
# something, not running anything, and neither requires any training to use.
router = APIRouter(prefix="/hospital-console", tags=["hospital-console"])


@public_router.get("", response_model=List[PublicHospitalOut])
def list_active_hospitals(city_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Hospitals currently enrolled in the Patient Concierge Program."""
    query = db.query(Hospital).filter(Hospital.is_active == True)  # noqa: E712
    if city_id:
        query = query.filter(Hospital.city_id == city_id)
    hospitals = query.order_by(Hospital.name).all()
    return [
        PublicHospitalOut(
            id=h.id, name=h.name,
            city_name=h.city.name if h.city else None,
            address=h.address, logo_url=h.logo_url,
        )
        for h in hospitals
    ]


@router.post("/auth/login", response_model=TokenOut)
@limiter.limit(settings.ADMIN_LOGIN_RATE_LIMIT)
def hospital_login(request: Request, payload: LoginIn, db: Session = Depends(get_db)):
    """The only endpoint that can issue a Hospital Console session."""
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    if user.role != UserRole.hospital_staff or not user.hospital_id or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
        expires_delta=timedelta(minutes=settings.ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenOut(access_token=token, role=user.role.value, user_id=user.id, full_name=user.full_name)


def _to_case_out(c: PatientCase) -> PatientCaseOut:
    """The Hospital Console's view of a case. Deliberately narrower than
    Admin's: no officer discharge link/photo bytes, no force-close audit
    trail — just enough to see what's happening and, if needed, dispute it."""
    on_duty = officer_on_duty(c)
    days_covered, billed_estimate = coverage_days_and_billing(c)
    return PatientCaseOut(
        id=c.id,
        hospital_id=c.hospital_id,
        hospital_name=c.hospital.name if c.hospital else None,
        patient_name=c.patient_name,
        patient_age=c.patient_age,
        attendant_name=c.attendant_name,
        attendant_phone=c.attendant_phone,
        ward_or_room=c.ward_or_room,
        short_note=c.short_note,
        admission_date=c.admission_date,
        expected_discharge_date=c.expected_discharge_date,
        status=c.status,
        daily_rate=c.daily_rate,
        days_covered=days_covered,
        billed_estimate=billed_estimate,
        # Falls back to the case's standing officer on any day with no daily
        # row, so the console stops saying "Awaiting today's officer" for a
        # patient who has had the same officer since admission.
        today_officer_name=on_duty.name,
        today_officer_is_fallback=on_duty.is_fallback,
        no_show_days=sum(1 for a in c.assignments if a.status == DailyAssignmentStatus.no_show),
        assigned_agent_id=c.assigned_agent_id,
        assigned_agent_name=c.assigned_agent.full_name if c.assigned_agent else None,
        hospital_discharge_at=c.hospital_discharge_at,
        officer_discharge_at=c.officer_discharge_at,
        hospital_discharge_by_name=c.hospital_discharge_by.full_name if c.hospital_discharge_by else None,
        officer_confirmation_required=requires_officer_confirmation(c),
        discharge_waiting_on=discharge_waiting_on(c),
        discharge_pending_since=discharge_pending_since(c),
        has_discharge_photo=bool(c.discharge_photo_url or c.discharge_photo_base64),
        discharge_photo_at=c.discharge_photo_at,
        hospital_notified_at=c.hospital_notified_at,
        hospital_dispute_deadline=c.hospital_dispute_deadline,
        can_dispute_discharge=(
            c.status == PatientCaseStatus.discharged
            and not c.hospital_disputed_at
            and hospital_dispute_window_open(c)
        ),
        hospital_disputed_at=c.hospital_disputed_at,
        hospital_dispute_note=c.hospital_dispute_note,
        # officer_discharge_token / photo bytes / force-close audit
        # deliberately omitted — the Hospital Console never sees those.
        created_at=c.created_at,
        discharged_at=c.discharged_at,
        assignments=[
            DailyAssignmentOut(
                id=a.id, date=a.date, agent_id=a.agent_id,
                agent_name=a.agent.full_name if a.agent else "\u2014",
                agent_phone=a.agent.phone if a.agent else None,
                status=a.status, note=a.note,
            )
            for a in c.assignments
        ],
        alerts=[CaseAlertOut(code=a.code, severity=a.severity, message=a.message)
                for a in build_case_alerts(c, for_admin=False)],
    )


def _hospital_cases_query(db: Session, hospital_id: int):
    return (
        db.query(PatientCase)
        .options(
            joinedload(PatientCase.assignments).joinedload(DailyOfficerAssignment.agent),
            joinedload(PatientCase.hospital),
            joinedload(PatientCase.assigned_agent),
            joinedload(PatientCase.hospital_discharge_by),
        )
        .filter(PatientCase.hospital_id == hospital_id)
    )


@router.get("/dashboard", response_model=HospitalDashboardOut)
def dashboard(db: Session = Depends(get_db), staff: User = Depends(require_hospital_staff)):
    hospital = db.query(Hospital).get(staff.hospital_id)
    today = datetime.utcnow().date()
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    active_cases = _hospital_cases_query(db, staff.hospital_id).filter(
        PatientCase.status == PatientCaseStatus.active
    ).all()
    active_patients = len(active_cases)
    # Counted through officer_on_duty() rather than "is there a daily row for
    # today", so a patient whose standing officer was assigned once at
    # admission still counts as covered long after the seeded From-To range
    # ran out. Previously this reported them as awaiting an officer forever.
    today_assigned = sum(1 for c in active_cases if officer_on_duty(c, today).covered)
    today_unassigned = active_patients - today_assigned

    discharged_this_month = (
        _hospital_cases_query(db, staff.hospital_id)
        .filter(PatientCase.status == PatientCaseStatus.discharged, PatientCase.discharged_at >= month_start)
        .count()
    )

    # Rough running estimate: every assignment logged this month, at that case's daily_rate.
    estimate = (
        db.query(func.count(DailyOfficerAssignment.id), PatientCase.daily_rate)
        .join(PatientCase, PatientCase.id == DailyOfficerAssignment.patient_case_id)
        .filter(PatientCase.hospital_id == staff.hospital_id, DailyOfficerAssignment.date >= month_start.date())
        .group_by(PatientCase.daily_rate)
        .all()
    )
    estimated_billing_this_month = sum(count * rate for count, rate in estimate)

    return HospitalDashboardOut(
        hospital_name=hospital.name if hospital else "\u2014",
        active_patients=active_patients,
        today_assigned=today_assigned,
        today_unassigned=today_unassigned,
        discharged_this_month=discharged_this_month,
        estimated_billing_this_month=round(estimated_billing_this_month, 2),
    )


@router.get("/patients", response_model=List[PatientCaseOut])
def list_patient_cases(
    status: Optional[str] = None,  # active | discharged | cancelled | all
    db: Session = Depends(get_db),
    staff: User = Depends(require_hospital_staff),
):
    query = _hospital_cases_query(db, staff.hospital_id).order_by(PatientCase.created_at.desc())
    if status and status != "all":
        try:
            status_filter = PatientCaseStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status filter")
        query = query.filter(PatientCase.status == status_filter)
    cases = query.limit(300).all()
    return [_to_case_out(c) for c in cases]


@router.get("/patients/{case_id}", response_model=PatientCaseOut)
def get_patient_case(case_id: int, db: Session = Depends(get_db), staff: User = Depends(require_hospital_staff)):
    case = _hospital_cases_query(db, staff.hospital_id).filter(PatientCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Patient case not found")
    return _to_case_out(case)


@router.post("/patients/{case_id}/dispute-discharge", response_model=PatientCaseOut)
def dispute_discharge(
    case_id: int,
    payload: HospitalDisputeIn,
    db: Session = Depends(get_db),
    staff: User = Depends(require_hospital_staff),
):
    """The hospital's one legitimate write action on a discharge: flag that
    the officer's confirmation looks wrong, within the notify-window
    (PatientCaseOut.hospital_dispute_deadline / can_dispute_discharge). Does
    NOT reopen the case or stop billing by itself — it raises a critical
    alert for ROSKYRO Admin to review and act on."""
    case = db.query(PatientCase).filter(PatientCase.id == case_id, PatientCase.hospital_id == staff.hospital_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Patient case not found")
    try:
        apply_hospital_dispute(case, payload.note)
    except DischargeValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    db.commit()
    db.refresh(case)
    return _to_case_out(case)


# ---------------------------------------------------------------------------
# Monthly billing — the Hospital Console can view every invoice and declare
# a payment it has made; only ROSKYRO Admin generates invoices and does the
# final "verified, marked paid" (see routers/hospital_admin.py).
# ---------------------------------------------------------------------------

@router.get("/invoices", response_model=List[HospitalInvoiceOut])
def list_my_invoices(db: Session = Depends(get_db), staff: User = Depends(require_hospital_staff)):
    from app.routers.hospital_admin import _to_invoice_out  # shared conversion, avoids duplicating it here

    invoices = (
        db.query(HospitalInvoice)
        .options(joinedload(HospitalInvoice.cases))
        .filter(HospitalInvoice.hospital_id == staff.hospital_id)
        .order_by(HospitalInvoice.generated_at.desc())
        .all()
    )
    return [_to_invoice_out(inv) for inv in invoices]


@router.post("/invoices/{invoice_id}/report-payment", response_model=HospitalInvoiceOut)
def report_invoice_payment(
    invoice_id: int,
    payload: ReportInvoicePaymentIn,
    db: Session = Depends(get_db),
    staff: User = Depends(require_hospital_staff),
):
    """The hospital declares it has paid an invoice — by cheque, netbanking,
    UPI or cash — with whatever reference it has. This moves the invoice to
    `payment_reported`, NOT `paid`: ROSKYRO Admin still verifies the money
    actually landed (against the bank/cheque/UPI records) before marking it
    paid. This is the hospital's entire billing workflow — declare, done."""
    from app.routers.hospital_admin import _to_invoice_out  # shared conversion

    invoice = (
        db.query(HospitalInvoice)
        .options(joinedload(HospitalInvoice.cases))
        .filter(HospitalInvoice.id == invoice_id, HospitalInvoice.hospital_id == staff.hospital_id)
        .first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status == HospitalInvoiceStatus.paid:
        raise HTTPException(status_code=400, detail="This invoice is already marked paid.")

    invoice.status = HospitalInvoiceStatus.payment_reported
    invoice.reported_payment_method = payload.method
    invoice.reported_payment_reference = payload.reference
    invoice.reported_payment_note = payload.note
    invoice.reported_at = datetime.utcnow()
    invoice.reported_by_id = staff.id
    db.commit()
    db.refresh(invoice)
    return _to_invoice_out(invoice)
