from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.utc_types import UTCDateTime


class DoctorOut(BaseModel):
    id: int
    full_name: str
    specialty: Optional[str] = None
    qualification: Optional[str] = None
    city_id: Optional[int] = None
    contact_phone: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    status: str
    max_members: int
    created_at: UTCDateTime

    class Config:
        from_attributes = True


class DoctorWithLoadOut(DoctorOut):
    """DoctorOut plus how many members they currently carry — used on the
    admin Doctors tab so capacity is visible without a second request per row."""
    assigned_member_count: int
    # This doctor's own no-login portal link state (see Doctor.portal_token) —
    # the admin Doctors tab uses these to show/issue/rotate the link, same as
    # the hospital program's officer portal-link card.
    portal_token: Optional[str] = None
    portal_token_expires_at: Optional[UTCDateTime] = None
    portal_link_live: bool = False


class DoctorCreateIn(BaseModel):
    full_name: str
    specialty: Optional[str] = None
    qualification: Optional[str] = None
    city_id: Optional[int] = None
    contact_phone: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    max_members: int = 40
    status: str = Field(default="active", pattern="^(active|inactive)$")


class DoctorUpdateIn(BaseModel):
    """All fields optional; only what's sent gets changed."""
    full_name: Optional[str] = None
    specialty: Optional[str] = None
    qualification: Optional[str] = None
    city_id: Optional[int] = None
    contact_phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    max_members: Optional[int] = None
    status: Optional[str] = Field(default=None, pattern="^(active|inactive)$")


class AssignDoctorIn(BaseModel):
    doctor_id: int
    # Capacity is an advisory (overridable) check — see
    # app/services/doctor_roster.py. Eligibility (doctor must be active) is
    # never overridable regardless of this flag.
    force: bool = False


class DoctorPortalLinkOut(BaseModel):
    """Returned when admin (re)issues a doctor's no-login portal link."""
    portal_token: str
    expires_at: Optional[UTCDateTime] = None


# ---------------------------------------------------------------------------
# The doctor's own no-login portal (routers/doctor.py) — everything a
# concierge doctor needs to see about the members currently assigned to
# them, and the two things they can do themselves: log a consultation
# against this year's allowance, and refer a member onward for coordination
# (mirrors what the concierge desk previously had to log for them, from
# AdminDoctorReferralIn, but now self-serve).
# ---------------------------------------------------------------------------

class DoctorPortalMemberOut(BaseModel):
    membership_id: int
    member_code: str
    customer_name: str
    customer_phone: str
    plan: str
    consultations_quota: Optional[int] = 0  # None = unlimited (doctor_concierge)
    consultations_used: int = 0
    consultations_remaining: Optional[int] = 0  # None when unlimited
    consultations_unlimited: bool = False
    open_care_request_count: int = 0


class DoctorPortalOut(BaseModel):
    full_name: str
    specialty: Optional[str] = None
    assigned_member_count: int
    members: list[DoctorPortalMemberOut] = []


class DoctorLogConsultationIn(BaseModel):
    membership_id: int
    note: Optional[str] = None
    occurred_at: Optional[UTCDateTime] = None


class DoctorConsultationOut(BaseModel):
    detail: str
    consultations_used: int
    consultations_quota: Optional[int] = 0  # None = unlimited (doctor_concierge)
    consultations_remaining: Optional[int] = 0  # None when unlimited
    consultations_unlimited: bool = False


class DoctorLogReferralIn(BaseModel):
    """The doctor referring a member onward for coordination, logged by the
    doctor themselves through their own portal — same shape/effect as
    AdminDoctorReferralIn (schemas/admin.py), which the concierge desk uses
    when logging on the doctor's behalf instead."""
    membership_id: int
    category: str = "other"
    title: str
    description: Optional[str] = None
    family_member_id: Optional[int] = None
