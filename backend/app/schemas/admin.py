from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.utc_types import UTCDateTime

from app.models.complaint import ComplaintCategory, ComplaintStatus


class CustomerOut(BaseModel):
    id: int
    full_name: str
    phone: str
    email: Optional[str] = None
    preferred_language: str
    is_active: bool
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class CustomerUpdateIn(BaseModel):
    """All fields optional — send just the ones you're changing. Phone/email
    are re-checked for uniqueness against other users before saving."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    preferred_language: Optional[str] = None
    is_active: Optional[bool] = None


class ComplaintOut(BaseModel):
    id: int
    name: str
    phone: str
    booking_code: Optional[str] = None  # legacy field, kept nullable for old records
    category: ComplaintCategory
    message: str
    status: ComplaintStatus
    is_priority: bool
    resolution_note: Optional[str] = None
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class ComplaintUpdateIn(BaseModel):
    status: ComplaintStatus
    resolution_note: Optional[str] = None


class TeamMemberOut(BaseModel):
    id: int
    full_name: str
    phone: str
    email: Optional[str] = None
    role: str
    is_active: bool
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class TeamMemberCreateIn(BaseModel):
    full_name: str
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: str = Field(default="support", pattern="^(admin|support)$")


class TeamMemberUpdateIn(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = Field(default=None, pattern="^(admin|support)$")
    is_active: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=6)


class AdminMembershipOut(BaseModel):
    id: int
    member_code: str
    plan: str
    status: str
    annual_price_snapshot: float
    started_at: UTCDateTime
    next_billing_date: Optional[UTCDateTime] = None
    customer_name: str
    customer_phone: str
    family_member_count: int
    relationship_officer_visits_quota: Optional[int] = 0  # None = unlimited (doctor_concierge)
    relationship_officer_visits_used: int = 0
    relationship_officer_visits_unlimited: bool = False
    # Doctor + Healthcare Concierge Membership fields — null for members on
    # any of the other three plans.
    assigned_doctor_id: Optional[int] = None
    assigned_doctor_name: Optional[str] = None
    doctor_consultations_quota: Optional[int] = 0  # None = unlimited (doctor_concierge)
    doctor_consultations_used: int = 0
    doctor_consultations_unlimited: bool = False
    # True once an unlimited member's usage crosses the fair-use soft
    # threshold (PLAN_FAIR_USE_SOFT_THRESHOLD_CONSULTATIONS) — informational
    # only, never blocks anything. See membership_quota.py.
    doctor_consultations_usage_flag: bool = False

    class Config:
        from_attributes = True


class AdminMembershipStatusIn(BaseModel):
    status: str = Field(..., pattern="^(pending|active|paused|cancelled|expired)$")


class AdminAssignDoctorIn(BaseModel):
    doctor_id: int
    force: bool = False  # override the capacity warning (see doctor_roster.py)


class AdminDoctorReferralIn(BaseModel):
    """Concierge desk logs a coordination request the member's doctor
    referred them for during a consultation — used when the doctor reports
    it by phone/WhatsApp rather than logging it themselves through their own
    portal (routers/doctor.py, same effect)."""
    membership_id: int
    category: str = "other"
    title: str
    description: Optional[str] = None
    family_member_id: Optional[int] = None


class AdminLogConsultationIn(BaseModel):
    """Concierge desk logs a doctor consultation on the doctor's behalf
    (phone/WhatsApp-reported) — counts against the member's annual
    doctor_concierge allowance exactly like one the doctor logs themselves
    through their own portal. See models.membership.DoctorConsultation."""
    membership_id: int
    note: Optional[str] = None
    occurred_at: Optional[UTCDateTime] = None


# ---------------------------------------------------------------------------
# Admin Care Requests board — every coordination ticket across every
# member, in one place, same shape/spirit as the Complaints board above.
# The member-facing GET/POST/cancel (routers/membership.py's own
# /care-requests) already existed for a member to see and raise their own
# tickets; this is the admin side that was missing — see one place to
# triage everything (including the doctor-referral ones the concierge desk
# or a doctor logs), filter it, and move it through status.
# ---------------------------------------------------------------------------

class AdminCareRequestOut(BaseModel):
    id: int
    membership_id: int
    member_code: str
    customer_name: str
    customer_phone: str
    plan: str
    family_member_id: Optional[int] = None
    family_member_name: Optional[str] = None
    category: str
    origin: str
    title: str
    description: Optional[str] = None
    status: str
    concierge_notes: Optional[str] = None
    created_at: UTCDateTime
    resolved_at: Optional[UTCDateTime] = None


class AdminCareRequestUpdateIn(BaseModel):
    status: Optional[str] = Field(None, pattern="^(open|in_progress|resolved|cancelled)$")
    concierge_notes: Optional[str] = None


class AdminInvoiceOut(BaseModel):
    id: int
    membership_id: int
    period_start: UTCDateTime
    period_end: UTCDateTime
    amount: float
    status: str
    paid_at: Optional[UTCDateTime] = None

    class Config:
        from_attributes = True


# ---------- Priority Access Network (admin) ----------

class AdminPartnerApplicationOut(BaseModel):
    id: int
    partner_type: str
    name: str
    city: str
    area: Optional[str] = None
    address: Optional[str] = None
    contact_number: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    maps_link: Optional[str] = None
    specialty: Optional[str] = None
    sub_specialty: Optional[str] = None
    qualification: Optional[str] = None
    affiliation: Optional[str] = None
    consultation_fee: Optional[float] = None
    priority_fee: Optional[float] = None
    priority_slots: Optional[str] = None
    available_days: Optional[str] = None
    available_timings: Optional[str] = None
    departments: Optional[str] = None
    specialists: Optional[str] = None
    opd_timings: Optional[str] = None
    emergency_available: Optional[bool] = None
    concierge_desk_contact: Optional[str] = None
    status: str
    review_notes: Optional[str] = None
    submitted_at: UTCDateTime

    class Config:
        from_attributes = True


class AdminApplicationReviewIn(BaseModel):
    approve: bool
    review_notes: Optional[str] = None


class AdminPartnerOut(BaseModel):
    id: int
    source_application_id: Optional[int] = None
    partner_type: str
    name: str
    city: str
    area: Optional[str] = None
    address: Optional[str] = None
    contact_number: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    maps_link: Optional[str] = None
    specialty: Optional[str] = None
    sub_specialty: Optional[str] = None
    qualification: Optional[str] = None
    affiliation: Optional[str] = None
    consultation_fee: Optional[float] = None
    priority_fee: Optional[float] = None
    priority_slots: Optional[str] = None
    available_days: Optional[str] = None
    available_timings: Optional[str] = None
    departments: Optional[str] = None
    specialists: Optional[str] = None
    opd_timings: Optional[str] = None
    emergency_available: Optional[bool] = None
    concierge_desk_contact: Optional[str] = None
    partner_status: str
    priority_access_status: str
    internal_notes: Optional[str] = None
    approved_at: UTCDateTime
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class AdminPartnerUpdateIn(BaseModel):
    partner_status: Optional[str] = Field(default=None, pattern="^(active|temporarily_unavailable|inactive)$")
    priority_access_status: Optional[str] = Field(default=None, pattern="^(available|not_available|by_request)$")
    internal_notes: Optional[str] = None
    consultation_fee: Optional[float] = None
    priority_fee: Optional[float] = None


class AdminAppointmentRequestOut(BaseModel):
    id: int
    partner_id: int
    patient_name: str
    patient_phone: str
    preferred_time: Optional[str] = None
    notes: Optional[str] = None
    status: str
    concierge_notes: Optional[str] = None
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class AdminAppointmentRequestUpdateIn(BaseModel):
    status: str = Field(..., pattern="^(requested|confirmed|cancelled)$")
    concierge_notes: Optional[str] = None


# ---------- Quick Add (manual entry for WhatsApp/phone-origin activity) ----------

class AdminPartnerQuickAddIn(BaseModel):
    partner_type: str = Field(..., pattern="^(doctor|hospital)$")
    name: str
    city: str
    area: Optional[str] = None
    address: Optional[str] = None
    contact_number: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    maps_link: Optional[str] = None
    specialty: Optional[str] = None
    sub_specialty: Optional[str] = None
    qualification: Optional[str] = None
    affiliation: Optional[str] = None
    consultation_fee: Optional[float] = None
    priority_fee: Optional[float] = None
    priority_slots: Optional[str] = None
    available_days: Optional[str] = None
    available_timings: Optional[str] = None
    departments: Optional[str] = None
    specialists: Optional[str] = None
    opd_timings: Optional[str] = None
    emergency_available: Optional[bool] = None
    concierge_desk_contact: Optional[str] = None
    internal_notes: Optional[str] = None


class AdminAppointmentQuickAddIn(BaseModel):
    partner_id: int
    patient_name: str
    patient_phone: str
    preferred_time: Optional[str] = None
    notes: Optional[str] = None
    status: str = Field(default="requested", pattern="^(requested|confirmed|cancelled)$")
    concierge_notes: Optional[str] = None


class AdminMembershipQuickAddIn(BaseModel):
    full_name: str
    phone: str
    plan: str = Field(..., pattern="^(doctor_concierge)$")
    # There is no fixed membership fee — the doctor's specialization and the
    # member's actual care needs move the price, so the admin enters
    # whatever was agreed with the member on the call, per-member, every
    # time. See app/models/membership.py.
    annual_price: float = Field(..., gt=0, description="Annual fee agreed with the member on the call.")
    mark_as_paid: bool = True   # ROSKYRO already collected payment over WhatsApp/UPI


class AdminMembershipQuickAddOut(BaseModel):
    membership: AdminMembershipOut
    account_created: bool
    temp_password: Optional[str] = None  # only returned when a new account was created — share with the member once


# ---------- Membership inquiries (leads from the public "Enquire" form) ----------

class AdminMembershipInquiryOut(BaseModel):
    id: int
    full_name: str
    phone: str
    message: Optional[str] = None
    status: str
    concierge_notes: Optional[str] = None
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class AdminMembershipInquiryUpdateIn(BaseModel):
    status: str = Field(..., pattern="^(new|contacted|converted|closed)$")
    concierge_notes: Optional[str] = None


# ============================================================================
# TODAY'S ACTION ITEMS — one combined widget summarising the four things the
# weekly/daily admin routine already checks by hand across separate tabs:
# discharge alerts, pending invoices (membership + hospital), new membership
# leads, and doctors near/over their member capacity. Built entirely from
# existing endpoints' underlying data — no new tables.
# ============================================================================

class ActionItemDoctorOut(BaseModel):
    id: int
    full_name: str
    assigned_member_count: int
    max_members: Optional[int] = None
    over_capacity: bool = False


class ActionItemsOut(BaseModel):
    discharge_alerts_count: int
    discharge_alerts_critical_count: int
    pending_membership_invoices_count: int
    pending_membership_invoices_amount: float
    pending_hospital_invoices_count: int
    pending_hospital_invoices_amount: float
    new_membership_inquiries_count: int
    doctors_near_or_over_capacity: List[ActionItemDoctorOut]
    total_action_items: int


