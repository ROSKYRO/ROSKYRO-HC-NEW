import random
import string
from datetime import datetime, timedelta
from typing import List, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.core.deps import require_admin
from app.core.enums import parse_enum_filter
from app.core.security import verify_password, create_access_token, hash_password
from app.core.limiter import limiter
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.agent import Agent, AgentStatus
from app.models.complaint import Complaint, ComplaintStatus
from app.models.city import City
from app.models.membership import (
    Membership, MembershipStatus, MembershipPlan,
    FamilyMember, MembershipInvoice, InvoiceStatus,
    CareRequest, CareRequestCategory, CareRequestStatus, CareRequestOrigin,
    DoctorConsultation, MembershipInquiry, InquiryStatus,
)
from app.models.doctor import Doctor, DoctorStatus
from app.services.membership_quota import relationship_officer_quota_status, doctor_consultation_quota_status
from app.services import doctor_roster
from app.models.priority_access import (
    PartnerApplication, ApplicationStatus, Partner, PartnerStatus,
    PriorityAccessAvailability, AppointmentRequest,
)
from app.schemas.admin import (
    CustomerOut, CustomerUpdateIn, ComplaintOut, ComplaintUpdateIn,
    TeamMemberOut, TeamMemberCreateIn, TeamMemberUpdateIn,
    AdminMembershipOut, AdminMembershipStatusIn, AdminInvoiceOut,
    AdminPartnerApplicationOut, AdminApplicationReviewIn,
    AdminPartnerOut, AdminPartnerUpdateIn,
    AdminAppointmentRequestOut, AdminAppointmentRequestUpdateIn,
    AdminPartnerQuickAddIn, AdminAppointmentQuickAddIn,
    AdminMembershipQuickAddIn, AdminMembershipQuickAddOut,
    AdminMembershipInquiryOut, AdminMembershipInquiryUpdateIn,
    AdminAssignDoctorIn, AdminDoctorReferralIn,
    AdminLogConsultationIn,
    AdminCareRequestOut, AdminCareRequestUpdateIn,
    ActionItemDoctorOut, ActionItemsOut,
)
from app.schemas.doctor import (
    DoctorOut, DoctorWithLoadOut, DoctorCreateIn, DoctorUpdateIn, DoctorPortalLinkOut,
)
from app.schemas.auth import LoginIn, TokenOut
from app.schemas.city import CityAdminOut, CityCreateIn, CityUpdateIn
from app.schemas.agent import AgentOut, PartnerCreateIn, PartnerStatusIn, PartnerUpdateIn
from app.models.notification import OutboundNotification, NotificationStatus
from app.schemas.notification import NotificationOut, MarkNotificationFailedIn
from app.routers.agents import list_agents
from app.routers.hospital_admin import list_hospitals, list_cases_needing_attention
from app.models.hospital import Hospital
from app.models.hospital_invoice import HospitalInvoice, HospitalInvoiceStatus
from app.services.hospital_billing import uninvoiced_discharged_cases
from app.services.patient_billing import coverage_days_and_billing
from app.services.pdf_export import build_admin_export_pdf

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/auth/login", response_model=TokenOut)
@limiter.limit(settings.ADMIN_LOGIN_RATE_LIMIT)
def admin_login(request: Request, payload: LoginIn, db: Session = Depends(get_db)):
    """The ONLY endpoint that can issue admin/support sessions. Deliberately
    separate from /auth/login (customer login) so the two are independently
    rate-limited, independently hardened, and never share a code path. Also
    issues a much shorter-lived token than customer sessions.
    """
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    if user.role not in (UserRole.admin, UserRole.support):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
        expires_delta=timedelta(minutes=settings.ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenOut(access_token=token, role=user.role.value, user_id=user.id, full_name=user.full_name)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total_agents = db.query(func.count(Agent.id)).scalar()
    active_agents = db.query(func.count(Agent.id)).filter(Agent.status == AgentStatus.active).scalar()
    agents_in_pipeline = db.query(func.count(Agent.id)).filter(
        Agent.status.in_([AgentStatus.applied, AgentStatus.screening, AgentStatus.interview, AgentStatus.background_check, AgentStatus.training])
    ).scalar()

    open_complaints = db.query(func.count(Complaint.id)).filter(Complaint.status == ComplaintStatus.open).scalar()
    priority_complaints = db.query(func.count(Complaint.id)).filter(Complaint.is_priority == True, Complaint.status == ComplaintStatus.open).scalar()  # noqa: E712

    return {
        "agents": {
            "total": total_agents,
            "active": active_agents,
            "in_pipeline": agents_in_pipeline,
        },
        "complaints": {
            "open": open_complaints,
            "priority_open": priority_complaints,
        },
    }


@router.get("/customers", response_model=List[CustomerOut])
def list_customers(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Every signed-up customer, most recent first."""
    customers = (
        db.query(User)
        .filter(User.role == UserRole.customer)
        .order_by(User.created_at.desc())
        .all()
    )
    return [
        CustomerOut(
            id=c.id,
            full_name=c.full_name,
            phone=c.phone,
            email=c.email,
            preferred_language=c.preferred_language,
            is_active=c.is_active,
            created_at=c.created_at,
        )
        for c in customers
    ]


@router.patch("/customers/{customer_id}", response_model=CustomerOut)
def admin_update_customer(
    customer_id: int,
    payload: CustomerUpdateIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Fix a customer's contact details or flip is_active to disable their
    login — without touching the database directly. Only fields present in
    the request body are changed (e.g. sending just {"is_active": false}
    deactivates the account and leaves everything else untouched)."""
    customer = db.query(User).filter(User.id == customer_id, User.role == UserRole.customer).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    data = payload.model_dump(exclude_unset=True)

    if "phone" in data and data["phone"]:
        new_phone = data.pop("phone")
        if new_phone != customer.phone:
            clash = db.query(User).filter(User.phone == new_phone, User.id != customer_id).first()
            if clash:
                raise HTTPException(status_code=400, detail="Another account already uses this phone number")
            customer.phone = new_phone

    if "email" in data:
        new_email = data.pop("email")
        if new_email and new_email != customer.email:
            clash = db.query(User).filter(User.email == new_email, User.id != customer_id).first()
            if clash:
                raise HTTPException(status_code=400, detail="Another account already uses this email")
        customer.email = new_email  # allows clearing it with an explicit null

    for field in ("full_name", "preferred_language", "is_active"):
        if field in data and data[field] is not None:
            setattr(customer, field, data[field])

    db.commit()
    db.refresh(customer)
    return customer


@router.get("/complaints", response_model=List[ComplaintOut])
def list_complaints(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """All complaints/feedback, priority (safety) + open ones surfaced first."""
    return (
        db.query(Complaint)
        .order_by(Complaint.is_priority.desc(), Complaint.created_at.desc())
        .all()
    )


@router.patch("/complaints/{complaint_id}", response_model=ComplaintOut)
def update_complaint(
    complaint_id: int,
    payload: ComplaintUpdateIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Mark a complaint in-review/resolved and optionally attach the admin's reply/notes."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.status = payload.status
    if payload.resolution_note is not None:
        complaint.resolution_note = payload.resolution_note
    if payload.status == ComplaintStatus.resolved:
        complaint.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(complaint)
    return complaint


# ============================================================================
# CITIES — add, mark live/inactive, delete
# ============================================================================

@router.get("/cities", response_model=List[CityAdminOut])
def admin_list_cities(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    cities = db.query(City).order_by(City.is_live.desc(), City.name).all()
    return [
        CityAdminOut(
            id=c.id, name=c.name, state=c.state, is_live=c.is_live,
            interest_count=c.interest_count, agent_count=len(c.agents),
        )
        for c in cities
    ]


@router.post("/cities", response_model=CityAdminOut)
def admin_create_city(payload: CityCreateIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if db.query(City).filter(City.name.ilike(payload.name)).first():
        raise HTTPException(status_code=400, detail="A city with this name already exists")
    city = City(name=payload.name, state=payload.state, is_live=payload.is_live)
    db.add(city)
    db.commit()
    db.refresh(city)
    return CityAdminOut(id=city.id, name=city.name, state=city.state, is_live=city.is_live, interest_count=city.interest_count, agent_count=0)


@router.patch("/cities/{city_id}", response_model=CityAdminOut)
def admin_update_city(city_id: int, payload: CityUpdateIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Edit name/state, or flip is_live to mark a city as live (bookable) or
    inactive (waitlist-only)."""
    city = db.query(City).get(city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(city, field, value)
    db.commit()
    db.refresh(city)
    return CityAdminOut(id=city.id, name=city.name, state=city.state, is_live=city.is_live, interest_count=city.interest_count, agent_count=len(city.agents))


@router.delete("/cities/{city_id}")
def admin_delete_city(city_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    city = db.query(City).get(city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    if city.agents:
        raise HTTPException(
            status_code=400,
            detail="This city has partners assigned and can't be deleted. Mark it inactive instead, or reassign its partners first.",
        )
    db.delete(city)
    db.commit()
    return {"detail": "City deleted"}


# ============================================================================
# PARTNERS (field agents) — add, activate/deactivate, delete
# ============================================================================

@router.post("/partners", response_model=AgentOut)
def admin_create_partner(payload: PartnerCreateIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Onboard a partner directly (skipping the public apply queue) — e.g.
    someone recruited offline who's already vetted."""
    if db.query(Agent).filter(Agent.phone == payload.phone).first():
        raise HTTPException(status_code=400, detail="A partner with this phone number already exists")
    agent = Agent(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        city_id=payload.city_id,
        monthly_base_pay=payload.monthly_base_pay,
        status=payload.status,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.patch("/partners/{agent_id}/status", response_model=AgentOut)
def admin_set_partner_status(agent_id: int, payload: PartnerStatusIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Quick active/inactive toggle for a partner — set status to 'active'
    to let them be assigned patients again, or 'suspended' to take them
    offline without deleting their record or history."""
    agent = db.query(Agent).get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Partner not found")
    agent.status = payload.status
    if payload.status == AgentStatus.suspended:
        agent.is_available = False
    db.commit()
    db.refresh(agent)
    return agent


@router.patch("/partners/{agent_id}", response_model=AgentOut)
def admin_update_partner(agent_id: int, payload: PartnerUpdateIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Edit a partner's rates and availability.

    is_available previously had no dedicated way to be set — it only ever
    flipped to False automatically on suspend, so the field was pure
    decoration everywhere it was displayed (the hospital-program assign
    dropdown showed "(unavailable)" but never enforced it). This is the one
    place it's actually written, and app/services/officer_roster.py is the
    one place it's actually enforced (alongside real-time capacity, which is
    a separate, computed signal — see the Officers tab)."""
    agent = db.query(Agent).get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Partner not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(agent, field, value)
    db.commit()
    db.refresh(agent)
    return agent


@router.delete("/partners/{agent_id}")
def admin_delete_partner(agent_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    agent = db.query(Agent).get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Partner not found")
    db.delete(agent)
    db.commit()
    return {"detail": "Partner removed"}


# ============================================================================
# TEAM (internal admin/support accounts) — add, activate/deactivate, delete
# ============================================================================

@router.get("/team", response_model=List[TeamMemberOut])
def admin_list_team(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    members = (
        db.query(User)
        .filter(User.role.in_([UserRole.admin, UserRole.support]))
        .order_by(User.created_at.desc())
        .all()
    )
    return [TeamMemberOut(id=m.id, full_name=m.full_name, phone=m.phone, email=m.email, role=m.role.value, is_active=m.is_active, created_at=m.created_at) for m in members]


@router.post("/team", response_model=TeamMemberOut)
def admin_create_team_member(payload: TeamMemberCreateIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if db.query(User).filter(User.phone == payload.phone).first():
        raise HTTPException(status_code=400, detail="An account with this phone number already exists")
    member = User(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole(payload.role),
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return TeamMemberOut(id=member.id, full_name=member.full_name, phone=member.phone, email=member.email, role=member.role.value, is_active=member.is_active, created_at=member.created_at)


@router.patch("/team/{member_id}", response_model=TeamMemberOut)
def admin_update_team_member(
    member_id: int,
    payload: TeamMemberUpdateIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_admin),
):
    """Edit a team member, change role, or flip is_active to disable their
    login without deleting the account."""
    member = db.query(User).filter(User.id == member_id, User.role.in_([UserRole.admin, UserRole.support])).first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    data = payload.model_dump(exclude_unset=True)

    if data.get("is_active") is False and member.id == current.id:
        raise HTTPException(status_code=400, detail="You can't deactivate your own account")

    if "role" in data and data["role"] is not None:
        member.role = UserRole(data.pop("role"))
    if "password" in data and data["password"]:
        member.hashed_password = hash_password(data.pop("password"))
    for field in ("full_name", "email", "is_active"):
        if field in data and data[field] is not None:
            setattr(member, field, data[field])

    db.commit()
    db.refresh(member)
    return TeamMemberOut(id=member.id, full_name=member.full_name, phone=member.phone, email=member.email, role=member.role.value, is_active=member.is_active, created_at=member.created_at)


@router.delete("/team/{member_id}")
def admin_delete_team_member(member_id: int, db: Session = Depends(get_db), current: User = Depends(require_admin)):
    member = db.query(User).filter(User.id == member_id, User.role.in_([UserRole.admin, UserRole.support])).first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    if member.id == current.id:
        raise HTTPException(status_code=400, detail="You can't delete your own account")
    remaining_admins = db.query(func.count(User.id)).filter(User.role == UserRole.admin, User.id != member.id).scalar()
    if member.role == UserRole.admin and remaining_admins == 0:
        raise HTTPException(status_code=400, detail="Can't delete the last remaining admin account")
    db.delete(member)
    db.commit()
    return {"detail": "Team member removed"}


# ---------- ROSKYRO Concierge membership management ----------

def _membership_to_admin_out(db: Session, m: Membership) -> AdminMembershipOut:
    family_count = db.query(func.count(FamilyMember.id)).filter(FamilyMember.membership_id == m.id).scalar()
    quota_status = relationship_officer_quota_status(m) if m.status == MembershipStatus.active else None
    doctor_quota = doctor_consultation_quota_status(m, db) if m.status == MembershipStatus.active else None
    return AdminMembershipOut(
        id=m.id,
        member_code=m.member_code,
        plan=m.plan.value,
        status=m.status.value,
        annual_price_snapshot=m.annual_price_snapshot,
        started_at=m.started_at,
        next_billing_date=m.next_billing_date,
        customer_name=m.user.full_name,
        customer_phone=m.user.phone,
        family_member_count=family_count or 0,
        relationship_officer_visits_quota=quota_status["quota"] if quota_status else 0,
        relationship_officer_visits_used=quota_status["used"] if quota_status else 0,
        relationship_officer_visits_unlimited=quota_status["unlimited"] if quota_status else False,
        assigned_doctor_id=m.assigned_doctor_id,
        assigned_doctor_name=m.assigned_doctor.full_name if m.assigned_doctor else None,
        doctor_consultations_quota=doctor_quota["quota"] if doctor_quota else 0,
        doctor_consultations_used=doctor_quota["used"] if doctor_quota else 0,
        doctor_consultations_unlimited=doctor_quota["unlimited"] if doctor_quota else False,
        doctor_consultations_usage_flag=doctor_quota["usage_flag"] if doctor_quota else False,
    )


@router.get("/memberships", response_model=List[AdminMembershipOut])
def admin_list_memberships(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Membership)
    parsed = parse_enum_filter(MembershipStatus, status_filter, "status_filter")
    if parsed:
        q = q.filter(Membership.status == parsed)
    memberships = q.order_by(Membership.created_at.desc()).all()
    return [_membership_to_admin_out(db, m) for m in memberships]


@router.patch("/memberships/{membership_id}/status", response_model=AdminMembershipOut)
def admin_update_membership_status(
    membership_id: int,
    payload: AdminMembershipStatusIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    membership = db.query(Membership).filter(Membership.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    membership.status = MembershipStatus(payload.status)
    if membership.status == MembershipStatus.cancelled:
        membership.cancelled_at = datetime.utcnow()
    db.commit()
    db.refresh(membership)
    return _membership_to_admin_out(db, membership)


@router.get("/memberships/invoices", response_model=List[AdminInvoiceOut])
def admin_list_invoices(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(MembershipInvoice)
    parsed = parse_enum_filter(InvoiceStatus, status_filter, "status_filter")
    if parsed:
        q = q.filter(MembershipInvoice.status == parsed)
    return q.order_by(MembershipInvoice.created_at.desc()).all()


@router.post("/memberships/invoices/{invoice_id}/mark-paid", response_model=AdminInvoiceOut)
def admin_mark_invoice_paid(invoice_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Manual payment confirmation — same pattern as Relationship Officer bookings (UPI
    screenshot confirmed on WhatsApp, then marked paid here). Activates the
    membership on its first invoice and pushes the next billing date out
    by one cycle."""
    invoice = db.query(MembershipInvoice).filter(MembershipInvoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.status = InvoiceStatus.paid
    invoice.paid_at = datetime.utcnow()

    membership = db.query(Membership).filter(Membership.id == invoice.membership_id).first()
    if membership:
        if membership.status == MembershipStatus.pending:
            membership.status = MembershipStatus.active
        membership.next_billing_date = invoice.period_end

    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/memberships/{membership_id}/invoices/renew", response_model=AdminInvoiceOut)
def admin_create_renewal_invoice(membership_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Manually generate the next billing-cycle invoice for a membership.
    (A scheduled job calling this automatically each cycle is the natural
    next step once this is running in production.)"""
    membership = db.query(Membership).filter(Membership.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    period_start = membership.next_billing_date or datetime.utcnow()
    period_end = period_start + timedelta(days=365)

    invoice = MembershipInvoice(
        membership_id=membership.id,
        period_start=period_start,
        period_end=period_end,
        amount=membership.annual_price_snapshot,
        status=InvoiceStatus.pending,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.patch("/memberships/{membership_id}/assign-doctor", response_model=AdminMembershipOut)
def admin_assign_doctor(
    membership_id: int, payload: AdminAssignDoctorIn,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    """Assign (or reassign) the concierge doctor for a Doctor + Healthcare
    Concierge Membership. Mirrors the hospital program's officer-assignment
    pattern: eligibility (doctor must be active) is a hard 400, capacity is
    a soft 409 the admin can push through with force=true."""
    membership = db.query(Membership).filter(Membership.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    doctor = db.query(Doctor).filter(Doctor.id == payload.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    try:
        doctor_roster.check_doctor_eligible(doctor)
        if not payload.force:
            doctor_roster.check_capacity(db, doctor, exclude_membership_id=membership.id)
    except doctor_roster.DoctorAssignmentError as e:
        status_code = 409 if e.overridable else 400
        raise HTTPException(status_code=status_code, detail=str(e))

    membership.assigned_doctor_id = doctor.id
    db.commit()
    db.refresh(membership)
    return _membership_to_admin_out(db, membership)


@router.delete("/memberships/{membership_id}/assign-doctor", response_model=AdminMembershipOut)
def admin_unassign_doctor(membership_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    membership = db.query(Membership).filter(Membership.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    membership.assigned_doctor_id = None
    db.commit()
    db.refresh(membership)
    return _membership_to_admin_out(db, membership)


@router.patch("/memberships/{membership_id}/change-plan", response_model=AdminMembershipOut)
def admin_change_membership_plan(membership_id: int):
    """There is currently only one membership plan (doctor_concierge), so
    there is nothing to migrate a member to. Kept as a stub for API
    compatibility with older frontend builds."""
    raise HTTPException(status_code=400, detail="There is only one membership plan; nothing to migrate to.")


# ============================================================================
# CONCIERGE DOCTORS (Doctor + Healthcare Concierge Membership)
# ============================================================================

def _doctor_to_load_out(db: Session, d: Doctor) -> DoctorWithLoadOut:
    load = doctor_roster.active_member_count(db, d.id)
    return DoctorWithLoadOut(
        id=d.id, full_name=d.full_name, specialty=d.specialty, qualification=d.qualification,
        city_id=d.city_id, contact_phone=d.contact_phone, whatsapp=d.whatsapp, email=d.email,
        bio=d.bio, status=d.status.value, max_members=d.max_members, created_at=d.created_at,
        assigned_member_count=load,
        portal_token=d.portal_token,
        portal_token_expires_at=d.portal_token_expires_at,
        portal_link_live=doctor_roster.portal_token_is_live(d),
    )


@router.get("/doctors", response_model=List[DoctorWithLoadOut])
def admin_list_doctors(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    doctors = db.query(Doctor).order_by(Doctor.full_name.asc()).all()
    return [_doctor_to_load_out(db, d) for d in doctors]


@router.post("/doctors", response_model=DoctorWithLoadOut)
def admin_create_doctor(payload: DoctorCreateIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    doctor = Doctor(
        full_name=payload.full_name,
        specialty=payload.specialty,
        qualification=payload.qualification,
        city_id=payload.city_id,
        contact_phone=payload.contact_phone,
        whatsapp=payload.whatsapp,
        email=payload.email,
        bio=payload.bio,
        max_members=payload.max_members,
        status=DoctorStatus(payload.status),
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return _doctor_to_load_out(db, doctor)


@router.patch("/doctors/{doctor_id}", response_model=DoctorWithLoadOut)
def admin_update_doctor(doctor_id: int, payload: DoctorUpdateIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    doctor = db.query(Doctor).get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        doctor.status = DoctorStatus(data.pop("status"))
    for field, value in data.items():
        setattr(doctor, field, value)
    db.commit()
    db.refresh(doctor)
    return _doctor_to_load_out(db, doctor)


@router.delete("/doctors/{doctor_id}")
def admin_delete_doctor(doctor_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    doctor = db.query(Doctor).get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    still_assigned = doctor_roster.active_member_count(db, doctor.id)
    if still_assigned:
        raise HTTPException(
            status_code=400,
            detail=f"Reassign this doctor's {still_assigned} current member(s) before deleting them.",
        )
    db.delete(doctor)
    db.commit()
    return {"detail": "Doctor removed"}


@router.post("/doctors/{doctor_id}/portal-link", response_model=DoctorPortalLinkOut)
def admin_issue_doctor_portal_link(doctor_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Mint (or rotate) this doctor's own no-login portal link — everything
    they need to see about their assigned members, plus the ability to log a
    consultation or refer a member onward themselves (routers/doctor.py).
    Rotating kills the previous link immediately, same as the officer 'my
    day' link this mirrors."""
    doctor = db.query(Doctor).get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    token = doctor_roster.issue_portal_token(doctor, rotate=True)
    db.commit()
    return DoctorPortalLinkOut(portal_token=token, expires_at=doctor.portal_token_expires_at)


@router.post("/doctors/{doctor_id}/consultations")
def admin_log_doctor_consultation(
    doctor_id: int, payload: AdminLogConsultationIn,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    """Concierge desk logs a consultation on the doctor's behalf (e.g.
    phone/WhatsApp-reported, or backfilling a consultation that happened
    before this doctor had a portal link) — counts against the member's
    annual allowance exactly like one the doctor logs themselves. See
    models.membership.DoctorConsultation and membership_quota.py."""
    doctor = db.query(Doctor).get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    membership = db.query(Membership).filter(Membership.id == payload.membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    if membership.assigned_doctor_id != doctor.id:
        raise HTTPException(status_code=400, detail="This member isn't currently assigned to this doctor.")

    consultation = DoctorConsultation(
        membership_id=membership.id,
        doctor_id=doctor.id,
        occurred_at=payload.occurred_at or datetime.utcnow(),
        note=payload.note,
        logged_by="admin",
    )
    db.add(consultation)
    db.commit()

    quota = doctor_consultation_quota_status(membership, db)
    return {
        "detail": "Consultation logged.",
        "consultations_used": quota["used"],
        "consultations_quota": quota["quota"],
        "consultations_remaining": quota["remaining"],
        "consultations_unlimited": quota["unlimited"],
    }


# ---------- Coordination requests raised on the doctor's behalf ----------
# The concierge desk's side of logging a doctor referral — for when a
# doctor reports it by phone/WhatsApp instead of logging it themselves
# through their own no-login portal (routers/doctor.py, same effect: an
# origin=doctor_referral CareRequest). Same "quick add" pattern already
# used for partners/appointments below.

@router.post("/care-requests/doctor-referral")
def admin_log_doctor_referral(
    payload: AdminDoctorReferralIn,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    """Log a coordination request the member's concierge doctor referred
    them for — origin=doctor_referral, so it's visibly distinct from a
    self-raised ticket on both the admin board and the member's own care
    history."""
    membership = db.query(Membership).filter(Membership.id == payload.membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
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


# ---------------------------------------------------------------------------
# Admin Care Requests board — every coordination ticket across every
# member, one place to triage, filter, and move through status. Same
# spirit as the Complaints board near the top of this file. The
# member-facing side (list their own tickets, raise one, cancel one) already
# existed at GET/POST/POST-cancel /membership/care-requests — this is the
# admin side that was missing.
# ---------------------------------------------------------------------------

def _care_request_to_admin_out(req: CareRequest) -> AdminCareRequestOut:
    m = req.membership
    return AdminCareRequestOut(
        id=req.id,
        membership_id=req.membership_id,
        member_code=m.member_code,
        customer_name=m.user.full_name,
        customer_phone=m.user.phone,
        plan=m.plan.value,
        family_member_id=req.family_member_id,
        family_member_name=req.family_member.full_name if req.family_member else None,
        category=req.category.value,
        origin=req.origin.value,
        title=req.title,
        description=req.description,
        status=req.status.value,
        concierge_notes=req.concierge_notes,
        created_at=req.created_at,
        resolved_at=req.resolved_at,
    )


@router.get("/care-requests", response_model=List[AdminCareRequestOut])
def admin_list_care_requests(
    status_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    origin_filter: Optional[str] = None,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    q = db.query(CareRequest)
    parsed_status = parse_enum_filter(CareRequestStatus, status_filter, "status_filter")
    if parsed_status:
        q = q.filter(CareRequest.status == parsed_status)
    parsed_category = parse_enum_filter(CareRequestCategory, category_filter, "category_filter")
    if parsed_category:
        q = q.filter(CareRequest.category == parsed_category)
    parsed_origin = parse_enum_filter(CareRequestOrigin, origin_filter, "origin_filter")
    if parsed_origin:
        q = q.filter(CareRequest.origin == parsed_origin)
    # Open/in-progress tickets first (the ones needing action), each group
    # newest-first — same triage-friendly ordering as the Complaints board.
    requests = q.order_by(
        CareRequest.status.in_([CareRequestStatus.resolved, CareRequestStatus.cancelled]).asc(),
        CareRequest.created_at.desc(),
    ).all()
    return [_care_request_to_admin_out(r) for r in requests]


@router.patch("/care-requests/{request_id}", response_model=AdminCareRequestOut)
def admin_update_care_request(
    request_id: int, payload: AdminCareRequestUpdateIn,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    req = db.query(CareRequest).filter(CareRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Care request not found")

    if payload.status is not None:
        new_status = CareRequestStatus(payload.status)
        req.status = new_status
        # resolved_at tracks the most recent move into "resolved" — cleared
        # if the ticket is later reopened, same as an admin fixing a status
        # set by mistake.
        req.resolved_at = datetime.utcnow() if new_status == CareRequestStatus.resolved else None
    if payload.concierge_notes is not None:
        req.concierge_notes = payload.concierge_notes

    db.commit()
    db.refresh(req)
    return _care_request_to_admin_out(req)


# ---------- Priority Access Network ----------

@router.get("/priority-access/applications", response_model=List[AdminPartnerApplicationOut])
def admin_list_applications(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(PartnerApplication)
    parsed = parse_enum_filter(ApplicationStatus, status_filter, "status_filter")
    if parsed:
        q = q.filter(PartnerApplication.status == parsed)
    return q.order_by(PartnerApplication.submitted_at.desc()).all()


@router.post("/priority-access/applications/{application_id}/review", response_model=Union[AdminPartnerOut, AdminPartnerApplicationOut])
def admin_review_application(
    application_id: int,
    payload: AdminApplicationReviewIn,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    application = db.query(PartnerApplication).filter(PartnerApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application.status != ApplicationStatus.pending:
        raise HTTPException(status_code=400, detail="This application has already been reviewed.")

    application.review_notes = payload.review_notes
    application.reviewed_by_id = admin.id
    application.reviewed_at = datetime.utcnow()

    if not payload.approve:
        application.status = ApplicationStatus.rejected
        db.commit()
        db.refresh(application)
        return application

    application.status = ApplicationStatus.approved

    partner = Partner(
        source_application_id=application.id,
        partner_type=application.partner_type,
        name=application.name,
        city=application.city,
        area=application.area,
        address=application.address,
        contact_number=application.contact_number,
        whatsapp=application.whatsapp,
        email=application.email,
        website=application.website,
        maps_link=application.maps_link,
        specialty=application.specialty,
        sub_specialty=application.sub_specialty,
        qualification=application.qualification,
        affiliation=application.affiliation,
        consultation_fee=application.consultation_fee,
        priority_fee=application.priority_fee,
        priority_slots=application.priority_slots,
        available_days=application.available_days,
        available_timings=application.available_timings,
        departments=application.departments,
        specialists=application.specialists,
        opd_timings=application.opd_timings,
        emergency_available=application.emergency_available,
        concierge_desk_contact=application.concierge_desk_contact,
        partner_status=PartnerStatus.active,
        priority_access_status=PriorityAccessAvailability.available,
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.get("/priority-access/partners", response_model=List[AdminPartnerOut])
def admin_list_partners(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Partner).order_by(Partner.name.asc()).all()


@router.patch("/priority-access/partners/{partner_id}", response_model=AdminPartnerOut)
def admin_update_priority_access_partner(
    partner_id: int,
    payload: AdminPartnerUpdateIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    data = payload.model_dump(exclude_unset=True)
    if "partner_status" in data:
        partner.partner_status = PartnerStatus(data.pop("partner_status"))
    if "priority_access_status" in data:
        partner.priority_access_status = PriorityAccessAvailability(data.pop("priority_access_status"))
    for field, value in data.items():
        setattr(partner, field, value)

    db.commit()
    db.refresh(partner)
    return partner


@router.get("/priority-access/appointment-requests", response_model=List[AdminAppointmentRequestOut])
def admin_list_appointment_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(AppointmentRequest)
    from app.models.priority_access import AppointmentRequestStatus
    parsed = parse_enum_filter(AppointmentRequestStatus, status_filter, "status_filter")
    if parsed:
        q = q.filter(AppointmentRequest.status == parsed)
    return q.order_by(AppointmentRequest.created_at.desc()).all()


@router.patch("/priority-access/appointment-requests/{request_id}", response_model=AdminAppointmentRequestOut)
def admin_update_appointment_request(
    request_id: int,
    payload: AdminAppointmentRequestUpdateIn,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    from app.models.priority_access import AppointmentRequestStatus
    req = db.query(AppointmentRequest).filter(AppointmentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Appointment request not found")

    req.status = AppointmentRequestStatus(payload.status)
    if payload.concierge_notes is not None:
        req.concierge_notes = payload.concierge_notes
    req.assigned_admin_id = admin.id
    if req.status in (AppointmentRequestStatus.confirmed, AppointmentRequestStatus.cancelled):
        req.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(req)
    return req


# ---------- Quick Add: manual entry for WhatsApp/phone-origin activity ----------
# ROSKYRO's real-world flow today runs through WhatsApp, not the site's own
# forms. These endpoints let an admin log that same activity straight into
# the system in a few seconds — no application/signup wait — so the admin
# dashboard reflects reality instead of sitting empty.

@router.post("/priority-access/partners/quick-add", response_model=AdminPartnerOut)
def admin_quick_add_partner(
    payload: AdminPartnerQuickAddIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Add a doctor/hospital straight to the live directory — for when they
    were verified over a WhatsApp/phone conversation instead of through the
    public application form."""
    partner = Partner(
        partner_status=PartnerStatus.active,
        priority_access_status=PriorityAccessAvailability.available,
        **payload.model_dump(),
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.post("/priority-access/appointment-requests/quick-add", response_model=AdminAppointmentRequestOut)
def admin_quick_add_appointment_request(
    payload: AdminAppointmentQuickAddIn,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Log a patient's appointment request that came in over WhatsApp/call,
    so it's tracked in the system and shows up in history — even though the
    patient never used the site form. Linked to an existing account by phone
    number if one exists; otherwise it's just tracked against the partner."""
    partner = db.query(Partner).filter(Partner.id == payload.partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    existing_user = db.query(User).filter(User.phone == payload.patient_phone).first()

    req = AppointmentRequest(
        partner_id=partner.id,
        user_id=existing_user.id if existing_user else None,
        patient_name=payload.patient_name,
        patient_phone=payload.patient_phone,
        preferred_time=payload.preferred_time,
        notes=payload.notes,
        status=payload.status,
        concierge_notes=payload.concierge_notes,
        assigned_admin_id=admin.id,
        resolved_at=datetime.utcnow() if payload.status in ("confirmed", "cancelled") else None,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.post("/memberships/quick-add", response_model=AdminMembershipQuickAddOut)
def admin_quick_add_membership(
    payload: AdminMembershipQuickAddIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Sign up a member who called in / messaged on WhatsApp instead of
    using the site's self-serve flow. Reuses their account if the phone
    number already exists; otherwise creates one with a temporary password
    to share with them (so they can still log in and see their dashboard
    later). Payment is assumed already confirmed over WhatsApp/UPI unless
    mark_as_paid is set to false."""
    user = db.query(User).filter(User.phone == payload.phone).first()
    account_created = False
    temp_password = None

    if not user:
        temp_password = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        user = User(
            full_name=payload.full_name,
            phone=payload.phone,
            hashed_password=hash_password(temp_password),
            role=UserRole.customer,
        )
        db.add(user)
        db.flush()
        account_created = True

    if db.query(Membership).filter(Membership.user_id == user.id).first():
        raise HTTPException(status_code=400, detail="This phone number already has a ROSKYRO Concierge membership.")

    plan = MembershipPlan(payload.plan)
    price = payload.annual_price  # agreed with the member on the call — no fixed plan price anymore
    now = datetime.utcnow()

    membership = Membership(
        member_code=f"RM-{random.randint(10000, 99999)}",
        user_id=user.id,
        plan=plan,
        status=MembershipStatus.active if payload.mark_as_paid else MembershipStatus.pending,
        annual_price_snapshot=price,
        started_at=now,
        next_billing_date=now + timedelta(days=365),
    )
    db.add(membership)
    db.flush()

    invoice = MembershipInvoice(
        membership_id=membership.id,
        period_start=now,
        period_end=now + timedelta(days=365),
        amount=price,
        status=InvoiceStatus.paid if payload.mark_as_paid else InvoiceStatus.pending,
        paid_at=now if payload.mark_as_paid else None,
    )
    db.add(invoice)
    db.commit()
    db.refresh(membership)

    return AdminMembershipQuickAddOut(
        membership=_membership_to_admin_out(db, membership),
        account_created=account_created,
        temp_password=temp_password,
    )


# ---------- Membership inquiries (leads from the public "Enquire" form) ----------
# No fixed fee is quoted on that form — a concierge calls the person back to
# understand their need, and once a price is agreed the admin turns this
# into an actual member via POST /memberships/quick-add (entering that price
# there). These endpoints are just for triaging the incoming leads.

@router.get("/membership-inquiries", response_model=List[AdminMembershipInquiryOut])
def list_membership_inquiries(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    parsed_status = parse_enum_filter(InquiryStatus, status, "status")
    query = db.query(MembershipInquiry)
    if parsed_status:
        query = query.filter(MembershipInquiry.status == parsed_status)
    return query.order_by(MembershipInquiry.created_at.desc()).all()


@router.patch("/membership-inquiries/{inquiry_id}", response_model=AdminMembershipInquiryOut)
def update_membership_inquiry(
    inquiry_id: int,
    payload: AdminMembershipInquiryUpdateIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    inquiry = db.query(MembershipInquiry).filter(MembershipInquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found.")
    inquiry.status = InquiryStatus(payload.status)
    if payload.concierge_notes is not None:
        inquiry.concierge_notes = payload.concierge_notes
    db.commit()
    db.refresh(inquiry)
    return inquiry


# ---------------------------------------------------------------------------
# Manual WhatsApp send queue — no WhatsApp Business API is wired up yet (see
# app/services/notifications.py), so every message the app "sends" queues
# here instead, for an admin to actually send themselves via a prefilled
# wa.me link and mark done. Genuinely one queue for the whole app — not
# hospital-specific — even though hospital-discharge notify is the only
# thing populating it today.
# ---------------------------------------------------------------------------

def _to_notification_out(n: OutboundNotification) -> NotificationOut:
    return NotificationOut(
        id=n.id, channel=n.channel, recipient_phone=n.recipient_phone,
        recipient_label=n.recipient_label, message=n.message, purpose=n.purpose,
        patient_case_id=n.patient_case_id, status=n.status, created_at=n.created_at,
        sent_at=n.sent_at, sent_by_name=n.sent_by.full_name if n.sent_by else None,
        failure_reason=n.failure_reason,
    )


@router.get("/notifications", response_model=List[NotificationOut])
def list_notifications(
    status: Optional[str] = "pending",  # pending | sent | failed | all
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(OutboundNotification)
    if status and status != "all":
        query = query.filter(
            OutboundNotification.status == parse_enum_filter(NotificationStatus, status, "status")
        )
    # Oldest-pending-first, so whoever's working the queue clears it in order
    # instead of newest-first burying an old one that's still waiting.
    notifications = query.order_by(OutboundNotification.created_at.asc()).limit(300).all()
    return [_to_notification_out(n) for n in notifications]


@router.post("/notifications/{notification_id}/mark-sent", response_model=NotificationOut)
def mark_notification_sent(
    notification_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """The admin has opened the wa.me link and actually tapped Send in their
    own WhatsApp — record that, and who did it. This is the entire "send":
    there's no way for ROSKYRO's backend to know a wa.me link was really
    used, so this is a self-reported confirmation, same trust level as any
    other manual step in this build (e.g. hospital payment reporting)."""
    n = db.query(OutboundNotification).filter(OutboundNotification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    if n.status == NotificationStatus.sent:
        raise HTTPException(status_code=400, detail="Already marked sent.")
    n.status = NotificationStatus.sent
    n.sent_at = datetime.utcnow()
    n.sent_by_id = admin.id
    n.failure_reason = None
    db.commit()
    db.refresh(n)
    return _to_notification_out(n)


@router.post("/notifications/{notification_id}/mark-failed", response_model=NotificationOut)
def mark_notification_failed(
    notification_id: int,
    payload: MarkNotificationFailedIn,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """The admin tried to send it and couldn't (wrong number, switched off,
    etc.) — keep it out of the pending queue without pretending it went out."""
    n = db.query(OutboundNotification).filter(OutboundNotification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.status = NotificationStatus.failed
    n.failure_reason = payload.reason
    n.sent_by_id = admin.id
    db.commit()
    db.refresh(n)
    return _to_notification_out(n)


@router.post("/notifications/{notification_id}/requeue", response_model=NotificationOut)
def requeue_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Put a failed notification back in the pending queue — e.g. after
    getting a corrected number from the hospital."""
    n = db.query(OutboundNotification).filter(OutboundNotification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.status = NotificationStatus.pending
    n.sent_at = None
    n.failure_reason = None
    db.commit()
    db.refresh(n)
    return _to_notification_out(n)


# ============================================================================
# TODAY'S ACTION ITEMS — the four things the recommended daily/weekly admin
# routine checks by hand (Discharge Alerts, Pending Invoices, Membership
# Inquiries, Doctor Capacity), combined into one widget. Every number here
# just re-derives from the same query each underlying tab already runs, so
# it can't drift out of sync with what those tabs show, and there's no new
# data model — the whole widget is a summary, not a source of truth.
# ============================================================================

@router.get("/action-items", response_model=ActionItemsOut)
def admin_action_items(db: Session = Depends(get_db), current: User = Depends(require_admin)):
    """One glance at what needs attention today, pulled from four existing
    endpoints: hospital discharge alerts, pending membership + hospital
    invoices, new (uncontacted) membership leads, and doctors at or near
    their member capacity."""

    # 1. Discharge alerts — cases stuck in pending-discharge, uncovered
    # patients, overdue expected-discharge dates, dead officer links.
    discharge_alerts = list_cases_needing_attention(db=db, admin=current)
    discharge_alerts_critical = sum(
        1 for c in discharge_alerts if any(a.severity == "critical" for a in c.alerts)
    )

    # 2. Pending membership invoices (annual billing, awaiting UPI confirm).
    pending_membership_invoices = (
        db.query(MembershipInvoice).filter(MembershipInvoice.status == InvoiceStatus.pending).all()
    )
    pending_membership_amount = round(sum(i.amount for i in pending_membership_invoices), 2)

    # 3. Pending hospital invoices — both invoices already generated but not
    # yet marked paid, AND discharged-but-not-yet-invoiced cases sitting on
    # every active hospital (the same number each hospital's own
    # pending-billing preview would show, summed across all hospitals).
    pending_hospital_invoices = (
        db.query(HospitalInvoice)
        .filter(HospitalInvoice.status.in_([HospitalInvoiceStatus.unpaid, HospitalInvoiceStatus.payment_reported]))
        .all()
    )
    pending_hospital_amount = round(sum(i.total_amount for i in pending_hospital_invoices), 2)
    pending_hospital_count = len(pending_hospital_invoices)

    hospitals = db.query(Hospital).filter(Hospital.is_active == True).all()  # noqa: E712
    for h in hospitals:
        uninvoiced_cases = uninvoiced_discharged_cases(db, h.id)
        if uninvoiced_cases:
            pending_hospital_count += 1
            pending_hospital_amount += round(sum(coverage_days_and_billing(c)[1] for c in uninvoiced_cases), 2)
    pending_hospital_amount = round(pending_hospital_amount, 2)

    # 4. New (uncontacted) membership leads from the "Enquire" form.
    new_inquiries_count = (
        db.query(func.count(MembershipInquiry.id))
        .filter(MembershipInquiry.status == InquiryStatus.new)
        .scalar()
    )

    # 5. Doctors at or over their member capacity (>= 80% of max_members
    # counts as "near", so a capacity crunch surfaces before it's a 409).
    doctors = db.query(Doctor).filter(Doctor.status == DoctorStatus.active).all()
    doctor_flags: List[ActionItemDoctorOut] = []
    for d in doctors:
        load = doctor_roster.active_member_count(db, d.id)
        if d.max_members and load >= d.max_members * 0.8:
            doctor_flags.append(ActionItemDoctorOut(
                id=d.id, full_name=d.full_name, assigned_member_count=load,
                max_members=d.max_members, over_capacity=load >= d.max_members,
            ))
    doctor_flags.sort(key=lambda x: (x.assigned_member_count / x.max_members) if x.max_members else 0, reverse=True)

    total = (
        len(discharge_alerts)
        + len(pending_membership_invoices)
        + pending_hospital_count
        + (new_inquiries_count or 0)
        + len(doctor_flags)
    )

    return ActionItemsOut(
        discharge_alerts_count=len(discharge_alerts),
        discharge_alerts_critical_count=discharge_alerts_critical,
        pending_membership_invoices_count=len(pending_membership_invoices),
        pending_membership_invoices_amount=pending_membership_amount,
        pending_hospital_invoices_count=pending_hospital_count,
        pending_hospital_invoices_amount=pending_hospital_amount,
        new_membership_inquiries_count=new_inquiries_count or 0,
        doctors_near_or_over_capacity=doctor_flags,
        total_action_items=total,
    )


# ============================================================================
# FULL DATA EXPORT — one PDF covering every data set on the Admin Dashboard.
# Each section below just re-calls the existing list endpoint above (same
# query, same ordering, same filters) so the export can never drift out of
# sync with what the dashboard itself shows — it only has to pick which
# fields of that same response are worth printing.
# ============================================================================

def _rows(objects, keys: List[str]) -> List[list]:
    return [[getattr(obj, k) for k in keys] for obj in objects]


@router.get("/export/all.pdf")
def admin_export_all_pdf(db: Session = Depends(get_db), current: User = Depends(require_admin)):
    """Download every data set visible across the Admin Dashboard's tabs —
    customers, team, partners, priority access, memberships & invoices,
    doctors, care requests, membership inquiries, hospitals, cities and the
    notification queue — as one consolidated PDF for offline records or
    sharing outside the dashboard."""

    customers = list_customers(db=db, _=current)
    complaints = [ComplaintOut.model_validate(c) for c in list_complaints(db=db, _=current)]
    cities = admin_list_cities(db=db, _=current)
    team = admin_list_team(db=db, _=current)
    partners = [AgentOut.model_validate(a) for a in list_agents(db=db, _=current)]
    memberships = admin_list_memberships(status_filter=None, db=db, _=current)
    invoices = [AdminInvoiceOut.model_validate(i) for i in admin_list_invoices(status_filter=None, db=db, _=current)]
    doctors = admin_list_doctors(db=db, _=current)
    care_requests = admin_list_care_requests(status_filter=None, category_filter=None, origin_filter=None, db=db, _=current)
    pa_applications = [AdminPartnerApplicationOut.model_validate(a) for a in admin_list_applications(status_filter=None, db=db, _=current)]
    pa_partners = [AdminPartnerOut.model_validate(p) for p in admin_list_partners(db=db, _=current)]
    pa_requests = [AdminAppointmentRequestOut.model_validate(r) for r in admin_list_appointment_requests(status_filter=None, db=db, _=current)]
    inquiries = [AdminMembershipInquiryOut.model_validate(i) for i in list_membership_inquiries(status=None, db=db, _=current)]
    notifications = list_notifications(status="all", db=db, _=current)
    hospitals = list_hospitals(db=db, admin=current)

    sections = [
        {
            "title": "Customers",
            "columns": ["ID", "Name", "Phone", "Email", "Language", "Active", "Joined"],
            "rows": _rows(customers, ["id", "full_name", "phone", "email", "preferred_language", "is_active", "created_at"]),
        },
        {
            "title": "Team (Admin / Support)",
            "columns": ["ID", "Name", "Phone", "Email", "Role", "Active", "Joined"],
            "rows": _rows(team, ["id", "full_name", "phone", "email", "role", "is_active", "created_at"]),
        },
        {
            "title": "Partners (Field Agents)",
            "columns": ["ID", "Name", "Phone", "Status", "Rank", "Verified %", "Monthly Pay", "Rating", "Jobs", "Available"],
            "rows": _rows(partners, ["id", "full_name", "phone", "status", "rank", "verification_progress", "monthly_base_pay", "rating_avg", "total_jobs", "is_available"]),
        },
        {
            "title": "Memberships",
            "columns": ["ID", "Member Code", "Customer", "Phone", "Plan", "Status", "Annual Price", "Started", "Next Billing", "Doctor"],
            "rows": _rows(memberships, ["id", "member_code", "customer_name", "customer_phone", "plan", "status", "annual_price_snapshot", "started_at", "next_billing_date", "assigned_doctor_name"]),
        },
        {
            "title": "Membership Invoices",
            "columns": ["ID", "Membership ID", "Period Start", "Period End", "Amount", "Status", "Paid At"],
            "rows": _rows(invoices, ["id", "membership_id", "period_start", "period_end", "amount", "status", "paid_at"]),
        },
        {
            "title": "Doctors",
            "columns": ["ID", "Name", "Specialty", "Qualification", "Phone", "Status", "Members Assigned", "Max Members"],
            "rows": _rows(doctors, ["id", "full_name", "specialty", "qualification", "contact_phone", "status", "assigned_member_count", "max_members"]),
        },
        {
            "title": "Care Requests",
            "columns": ["ID", "Member", "Customer", "Category", "Origin", "Title", "Status", "Created"],
            "rows": _rows(care_requests, ["id", "member_code", "customer_name", "category", "origin", "title", "status", "created_at"]),
        },
        {
            "title": "Priority Access — Partner Applications",
            "columns": ["ID", "Name", "Type", "City", "Contact", "Status", "Submitted"],
            "rows": _rows(pa_applications, ["id", "name", "partner_type", "city", "contact_number", "status", "submitted_at"]),
        },
        {
            "title": "Priority Access — Approved Partners",
            "columns": ["ID", "Name", "Type", "City", "Partner Status", "Priority Status", "Consult Fee", "Priority Fee"],
            "rows": _rows(pa_partners, ["id", "name", "partner_type", "city", "partner_status", "priority_access_status", "consultation_fee", "priority_fee"]),
        },
        {
            "title": "Priority Access — Appointment Requests",
            "columns": ["ID", "Partner ID", "Patient", "Phone", "Preferred Time", "Status", "Created"],
            "rows": _rows(pa_requests, ["id", "partner_id", "patient_name", "patient_phone", "preferred_time", "status", "created_at"]),
        },
        {
            "title": "Membership Inquiries (Leads)",
            "columns": ["ID", "Name", "Phone", "Message", "Status", "Created"],
            "rows": _rows(inquiries, ["id", "full_name", "phone", "message", "status", "created_at"]),
        },
        {
            "title": "Hospitals",
            "columns": ["ID", "Name", "City", "Contact", "Phone", "Contract Status", "Active"],
            "rows": _rows(hospitals, ["id", "name", "city_name", "contact_name", "contact_phone", "contract_status", "is_active"]),
        },
        {
            "title": "Cities",
            "columns": ["ID", "Name", "State", "Live", "Interest Count", "Partners"],
            "rows": _rows(cities, ["id", "name", "state", "is_live", "interest_count", "agent_count"]),
        },
        {
            "title": "Complaints",
            "columns": ["ID", "Name", "Phone", "Category", "Priority", "Status", "Created"],
            "rows": _rows(complaints, ["id", "name", "phone", "category", "is_priority", "status", "created_at"]),
        },
        {
            "title": "Notifications Queue",
            "columns": ["ID", "Channel", "Recipient", "Purpose", "Status", "Created", "Sent At"],
            "rows": _rows(notifications, ["id", "channel", "recipient_phone", "purpose", "status", "created_at", "sent_at"]),
        },
    ]

    pdf = build_admin_export_pdf(sections, generated_by=current.full_name)
    filename = f"roskyro-admin-export-{datetime.utcnow().strftime('%Y%m%d-%H%M')}.pdf"
    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
