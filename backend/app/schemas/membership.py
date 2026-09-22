from datetime import datetime
from app.schemas.utc_types import UTCDateTime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.schemas.doctor import DoctorOut


# ---------- Inquiry (replaces the old instant priced signup) ----------
# There is no fixed membership fee: the doctor's specialization and the
# member's actual care needs both move the price. A prospective member
# submits this instead of paying anything up front; a concierge calls them
# back, and an admin creates the priced Membership by hand once the fee is
# agreed (see AdminMembershipQuickAddIn.annual_price).

class MembershipInquiryIn(BaseModel):
    full_name: str
    phone: str
    message: Optional[str] = Field(
        default=None,
        description="What they told us they need — e.g. specialization, family member's condition/age.",
    )


class MembershipInquiryOut(BaseModel):
    id: int
    full_name: str
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class MembershipOut(BaseModel):
    id: int
    member_code: str
    plan: str
    status: str
    annual_price_snapshot: float
    started_at: UTCDateTime
    next_billing_date: Optional[UTCDateTime] = None
    # Populated only for the doctor_concierge plan (or any membership an
    # admin has manually assigned a doctor to) — see Membership.assigned_doctor.
    assigned_doctor: Optional[DoctorOut] = None

    class Config:
        from_attributes = True


# ---------- Family members ----------

class FamilyMemberIn(BaseModel):
    full_name: str
    relation: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    # Intentionally no free-text "notes" field — see model comment. Any
    # health/medical detail goes to the concierge over WhatsApp, not here.


class FamilyMemberOut(FamilyMemberIn):
    id: int
    created_at: UTCDateTime

    class Config:
        from_attributes = True


# ---------- Care requests (also doubles as Care History) ----------

class CareRequestIn(BaseModel):
    family_member_id: Optional[int] = None
    category: str = "other"
    title: str
    description: Optional[str] = None


class CareRequestOut(BaseModel):
    id: int
    family_member_id: Optional[int] = None
    category: str
    # "member" (the customary self-raised ticket) or "doctor_referral" — set
    # when the concierge desk logs a referral the member's doctor made
    # during a consultation. See AdminCareRequestQuickAddIn for how the
    # latter gets created (admin can't be set by the member themselves).
    origin: str
    title: str
    description: Optional[str] = None
    status: str
    concierge_notes: Optional[str] = None
    created_at: UTCDateTime
    resolved_at: Optional[UTCDateTime] = None

    class Config:
        from_attributes = True


class CareRequestStatusIn(BaseModel):
    status: str
    concierge_notes: Optional[str] = None


# ---------- Document vault ----------
# Metadata-only by design — no file_url/notes/description here. See
# CareDocument model docstring: the actual document is shared with the
# concierge over WhatsApp, never uploaded to or described in our DB.

class CareDocumentIn(BaseModel):
    family_member_id: Optional[int] = None
    title: str
    doc_type: str = "other"


class CareDocumentOut(CareDocumentIn):
    id: int
    status: str
    uploaded_at: UTCDateTime

    class Config:
        from_attributes = True


# ---------- Transport requests ----------

class TransportRequestIn(BaseModel):
    family_member_id: Optional[int] = None
    pickup_address: str
    drop_address: str
    # Deliberately a plain (naive, wall-clock) datetime, NOT UTCDateTime: the
    # member picks it on a datetime-local input and it is stored/returned exactly
    # as typed, never compared with utcnow(). See app/core/timeutil.py.
    requested_time: datetime
    is_same_city: bool = True
    notes: Optional[str] = None


class TransportRequestOut(TransportRequestIn):
    id: int
    status: str
    created_at: UTCDateTime

    class Config:
        from_attributes = True


# ---------- Billing ----------

class MembershipInvoiceOut(BaseModel):
    id: int
    period_start: UTCDateTime
    period_end: UTCDateTime
    amount: float
    status: str
    paid_at: Optional[UTCDateTime] = None
    created_at: UTCDateTime

    class Config:
        from_attributes = True


# ---------- Relationship Officer-visit quota ----------

class RelationshipOfficerQuotaOut(BaseModel):
    is_member: bool
    plan: Optional[str] = None
    status: Optional[str] = None  # membership status; quota only actually applies when this is "active"
    quota: Optional[int] = 0  # None = unlimited (currently only doctor_concierge) — see models/membership.py
    used: int = 0
    remaining: Optional[int] = 0  # None when quota is unlimited
    unlimited: bool = False
    usage_flag: bool = False  # informational only — never blocks anything, see membership_quota.py
    period_end: Optional[UTCDateTime] = None


# ---------- Doctor consultation quota (doctor_concierge plan) ----------
# Same shape as RelationshipOfficerQuotaOut, kept as a separate class rather
# than reused because the two quotas reset on different cycles (monthly vs
# annual — see membership_quota.py) and covering completely different plan
# fields under one name would be confusing on the wire.

class DoctorConsultationQuotaOut(BaseModel):
    is_member: bool
    plan: Optional[str] = None
    status: Optional[str] = None
    quota: Optional[int] = 0  # None = unlimited (doctor_concierge) — see models/membership.py
    used: int = 0
    remaining: Optional[int] = 0  # None when quota is unlimited
    unlimited: bool = False
    usage_flag: bool = False  # informational only — never blocks anything, see membership_quota.py
    period_end: Optional[UTCDateTime] = None


# ---------- Combined dashboard payload ----------

class MemberDashboardOut(BaseModel):
    membership: MembershipOut
    family_members: List[FamilyMemberOut]
    recent_care_requests: List[CareRequestOut]
    recent_documents: List[CareDocumentOut]
    recent_transport_requests: List[TransportRequestOut]
    latest_invoice: Optional[MembershipInvoiceOut] = None
    max_family_members: int
