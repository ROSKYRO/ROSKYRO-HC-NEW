import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Enum, Float, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class MembershipPlan(str, enum.Enum):
    # "ROSKYRO Doctor + Healthcare Concierge Membership" — the only plan
    # ROSKYRO offers. A member on this plan gets a dedicated concierge
    # doctor (Membership.assigned_doctor) who owns the clinical
    # relationship; ROSKYRO coordinates everything the doctor refers them
    # to. See app/models/doctor.py and PLAN_DOCTOR_CONSULTATIONS_PER_YEAR
    # below for the consultation allowance this plan bundles.
    doctor_concierge = "doctor_concierge"


class MembershipStatus(str, enum.Enum):
    pending = "pending"    # signed up, first invoice not yet marked paid
    active = "active"
    paused = "paused"
    cancelled = "cancelled"
    expired = "expired"    # billing lapsed and grace period passed


# Billed annually. There is deliberately NO fixed price dict for this plan:
# the doctor's specialization and the member's actual care needs both move
# the fee, so a flat number here would be wrong more often than right.
# Instead, a prospective member submits a MembershipInquiry (see below), a
# concierge understands their need over a call, and an admin enters the
# agreed price by hand on Membership.annual_price_snapshot when the
# membership is actually created (POST /admin/memberships/quick-add — see
# AdminMembershipQuickAddIn.annual_price in schemas/admin.py). Limits below
# are still placeholders in the same spirit as before.

PLAN_MAX_FAMILY_MEMBERS = {
    # Individual-only for the initial launch of this plan — the business
    # description centers on "the member" and their one doctor. Raise this
    # if ROSKYRO wants a family variant of the doctor-led plan later.
    MembershipPlan.doctor_concierge: 1,
}

# Free ROSKYRO Relationship Officer visits — quota resets every calendar
# month (see services/membership_quota.py), independent of the annual
# billing cycle above.
PLAN_FREE_ASSIST_VISITS = {
    # "No hourly billing for concierge assistance... unlimited concierge
    # coordination under the membership's fair-use policy" — no hard
    # numeric cap here. None means "no ceiling", not "zero" — see
    # PLAN_FAIR_USE_SOFT_THRESHOLD_VISITS below for how fair-use is enforced
    # without one, and membership_quota.py for how a None quota is handled.
    MembershipPlan.doctor_concierge: None,
}

# Annual allowances bundled into the plan (reset once a year, with the
# membership's billing cycle — unlike the Relationship Officer visit quota above).
PLAN_DOCTOR_CONSULTATIONS_PER_YEAR = {
    # "Priority doctor access" + unlimited coordination: no hard cap.
    MembershipPlan.doctor_concierge: None,
}

# ---------------------------------------------------------------------------
# Fair-use soft thresholds — ONLY meaningful for a plan whose quota above is
# None (currently doctor_concierge). These never block a member from
# anything and never appear as a hard denial anywhere in the API; they only
# set `usage_flag=True` on that plan's quota-status dict once usage in the
# current period crosses the number, so the concierge desk sees "this looks
# unusual" and can have a human conversation — never an automatic cutoff.
# ---------------------------------------------------------------------------
PLAN_FAIR_USE_SOFT_THRESHOLD_VISITS = {
    MembershipPlan.doctor_concierge: 20,  # /month
}
PLAN_FAIR_USE_SOFT_THRESHOLD_CONSULTATIONS = {
    MembershipPlan.doctor_concierge: 40,  # /year
}

PLAN_AMBULANCE_ASSISTS_PER_YEAR = {
    MembershipPlan.doctor_concierge: 4,
}

PLAN_MEDICAL_TRAVEL_ASSISTS_PER_YEAR = {
    # "Medical travel coordination when required" is explicitly called out
    # for this plan.
    MembershipPlan.doctor_concierge: 6,
}

# Frequent Care needs — dialysis, regular physiotherapy, recurring hospital
# visits, BP/diabetes check-ups, etc. — are not covered by the fixed annual
# allowances above. They are handled through the standard hourly Relationship
# Officer booking system.
FREQUENT_CARE_NOTE = (
    "Frequent Care needs — dialysis, regular physiotherapy, recurring hospital "
    "visits, BP/diabetes check-ups, and similar recurring needs — are covered "
    "through the standard hourly booking system."
)


class InquiryStatus(str, enum.Enum):
    new = "new"                # just submitted, nobody has called them yet
    contacted = "contacted"    # concierge has spoken to them, discussing need/price
    converted = "converted"    # became an actual Membership (see AdminMembershipInquiryUpdateIn)
    closed = "closed"          # not proceeding


class MembershipInquiry(Base):
    """A lead from the public 'Enquire' form — deliberately NOT a priced
    signup. Doctor specialization and the member's actual care needs both
    move the fee, so we never quote or charge a number here. A concierge
    calls the person back, understands what they need, and — once a price
    is agreed — an admin turns this into a real Membership by hand via
    POST /admin/memberships/quick-add, entering that agreed price there.
    This row is left as status=converted afterwards for the record; it is
    never itself billed."""
    __tablename__ = "membership_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    # What they told us they need — e.g. "cardiologist for my father, 70,
    # diabetic" — used purely to prep the callback, never priced off of
    # automatically.
    message = Column(Text, nullable=True)
    status = Column(Enum(InquiryStatus), default=InquiryStatus.new, nullable=False)
    concierge_notes = Column(Text, nullable=True)  # internal — call outcome, price discussed, etc.

    created_at = Column(DateTime, default=datetime.utcnow)


class Membership(Base):
    """A recurring ROSKYRO Concierge membership — separate from one-off
    ROSKYRO Relationship Officer bookings. One User has at most one Membership."""
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    member_code = Column(String, unique=True, index=True, nullable=False)  # e.g. RM-10234

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    plan = Column(Enum(MembershipPlan), nullable=False)
    status = Column(Enum(MembershipStatus), default=MembershipStatus.pending, nullable=False)

    # Capacity is enforced in app/services/doctor_roster.py, not here.
    assigned_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)

    annual_price_snapshot = Column(Float, nullable=False)  # locked in at signup, unaffected by future price changes
    started_at = Column(DateTime, default=datetime.utcnow)
    next_billing_date = Column(DateTime, nullable=True)  # annual renewal date
    cancelled_at = Column(DateTime, nullable=True)

    notes = Column(Text, nullable=True)  # internal concierge notes
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    assigned_doctor = relationship("Doctor", back_populates="memberships")
    family_members = relationship("FamilyMember", back_populates="membership", cascade="all, delete-orphan")
    care_requests = relationship("CareRequest", back_populates="membership", cascade="all, delete-orphan")
    documents = relationship("CareDocument", back_populates="membership", cascade="all, delete-orphan")
    transport_requests = relationship("TransportRequest", back_populates="membership", cascade="all, delete-orphan")
    invoices = relationship("MembershipInvoice", back_populates="membership", cascade="all, delete-orphan")
    consultations = relationship("DoctorConsultation", back_populates="membership", cascade="all, delete-orphan")


class FamilyMember(Base):
    """A dependent covered under a Family/NRI membership (or the member's
    own profile entry, for symmetry with care requests/documents)."""
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=False)

    full_name = Column(String, nullable=False)
    relation = Column(String, nullable=True)   # e.g. "Self", "Mother", "Father", "Spouse", "Child"
    age = Column(Integer, nullable=True)
    phone = Column(String, nullable=True)
    # No free-text "notes" field here on purpose — this used to allow members to
    # paste allergies/conditions, which we do not want landing in the DB. Any
    # health/medical detail a member needs to share goes to the concierge over
    # WhatsApp, not into a stored field. Do not re-add a free-text health field
    # here without also wiring the retention/auto-delete job (see CareDocument).

    created_at = Column(DateTime, default=datetime.utcnow)

    membership = relationship("Membership", back_populates="family_members")


class CareRequestCategory(str, enum.Enum):
    appointment = "appointment"
    hospital = "hospital"
    diagnostic = "diagnostic"
    specialist = "specialist"
    follow_up = "follow_up"
    # Added for the Doctor + Healthcare Concierge Membership: these cover
    # everything the business spec says ROSKYRO coordinates once the
    # concierge doctor refers a member onward — "admission/discharge
    # assistance, physical assistance, ... records coordination and family
    # updates ... medical travel coordination".
    admission = "admission"
    discharge = "discharge"
    physical_assistance = "physical_assistance"
    records = "records"
    family_update = "family_update"
    medical_travel = "medical_travel"
    other = "other"


class CareRequestOrigin(str, enum.Enum):
    # The member (or their family) raised this themselves.
    member = "member"
    # The concierge doctor referred the member onward during a consultation
    # — either logged by the doctor themselves through their own no-login
    # portal (routers/doctor.py), or by the concierge desk on the doctor's
    # behalf over phone/WhatsApp (POST /admin/care-requests/doctor-referral,
    # same "quick add" pattern used elsewhere in admin). Both write this
    # same origin value; there's no way to tell which path was used from
    # this field alone (see CareRequest — nothing else records that either).
    doctor_referral = "doctor_referral"


class CareRequestStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    cancelled = "cancelled"


class CareRequest(Base):
    """One coordination ticket raised by a member — this doubles as the
    member's Care History once resolved (nothing is deleted on close)."""
    __tablename__ = "care_requests"

    id = Column(Integer, primary_key=True, index=True)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=False)
    family_member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)  # null = the member themselves

    category = Column(Enum(CareRequestCategory), default=CareRequestCategory.other, nullable=False)
    origin = Column(Enum(CareRequestOrigin), default=CareRequestOrigin.member, nullable=False)
    title = Column(String, nullable=False)
    # Free text, member-entered. Frontend placeholder steers members toward
    # "reason for the visit" (e.g. "follow-up visit") rather than diagnosis or
    # report detail — but this field is not validated/sanitized server-side,
    # so treat it as potentially containing health info in practice.
    description = Column(Text, nullable=True)
    status = Column(Enum(CareRequestStatus), default=CareRequestStatus.open, nullable=False)

    # Internal/admin-visible updates shared back to the member. Staff SOP:
    # keep these to coordination status (fee, slot, confirmation) — do not
    # copy diagnosis/report detail in here.
    concierge_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    membership = relationship("Membership", back_populates="care_requests")
    family_member = relationship("FamilyMember")


class CareDocumentStatus(str, enum.Enum):
    pending = "pending"                    # ticket raised, member still needs to send the file on WhatsApp
    shared_with_concierge = "shared_with_concierge"  # concierge has received/confirmed the file over WhatsApp
    resolved = "resolved"


class CareDocument(Base):
    """Document vault entry — deliberately metadata-only.

    Policy: prescriptions/reports/discharge summaries are health data. We do
    NOT store the file, a link to it, or any free-text description of its
    contents in this table (or anywhere else in the DB) — only a title,
    doc_type, and a coordination status. The actual document is shared
    directly between the member and the concierge over WhatsApp; this row is
    just a tracker so both sides know a document is expected/received.

    Do not add file_url/notes/description columns back here without also
    building the retention/auto-delete job — see membership dev notes.
    """
    __tablename__ = "care_documents"

    id = Column(Integer, primary_key=True, index=True)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=False)
    family_member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)

    title = Column(String, nullable=False)
    doc_type = Column(String, default="other")  # prescription / report / discharge_summary / insurance / other
    status = Column(Enum(CareDocumentStatus), default=CareDocumentStatus.pending, nullable=False)

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    membership = relationship("Membership", back_populates="documents")
    family_member = relationship("FamilyMember")


class TransportStatus(str, enum.Enum):
    requested = "requested"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class TransportRequest(Base):
    """A pickup/drop coordination request tied to a membership.

    Policy (per business rule): same-city trips are coordinated as part of
    the membership at no extra charge. Outstation trips are still fully
    coordinated by the concierge, but the member arranges/pays for their own
    travel — ROSKYRO does not bill anything beyond the membership price for
    this. `is_same_city` drives which of those two notes is shown to the
    member; it never triggers a separate ROSKYRO charge.
    """
    __tablename__ = "transport_requests"

    id = Column(Integer, primary_key=True, index=True)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=False)
    family_member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)

    pickup_address = Column(Text, nullable=False)
    drop_address = Column(Text, nullable=False)
    requested_time = Column(DateTime, nullable=False)
    is_same_city = Column(Boolean, default=True)

    status = Column(Enum(TransportStatus), default=TransportStatus.requested, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    membership = relationship("Membership", back_populates="transport_requests")
    family_member = relationship("FamilyMember")


class InvoiceStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    waived = "waived"


class MembershipInvoice(Base):
    """One billing cycle (usually monthly) for a membership. MVP scope: no
    payment gateway is wired up yet — invoices are marked paid manually by
    an admin (e.g. after a UPI payment confirmed on WhatsApp), same pattern
    ROSKYRO already uses for Relationship Officer bookings."""
    __tablename__ = "membership_invoices"

    id = Column(Integer, primary_key=True, index=True)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=False)

    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.pending, nullable=False)

    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    membership = relationship("Membership", back_populates="invoices")


class DoctorConsultation(Base):
    """One logged consultation between a member and their assigned concierge
    doctor, on the doctor_concierge plan's annual PLAN_DOCTOR_CONSULTATIONS_PER_YEAR
    allowance. This is the row services/membership_quota.py counts against
    that allowance to compute real `used`/`remaining` figures — previously
    `used` was hardcoded to 0 everywhere (see that module's history) because
    nothing wrote usage anywhere. A row here can be logged two ways: the
    doctor logs it themselves through their own no-login portal
    (routers/doctor.py), or the concierge desk logs it on the doctor's
    behalf from the admin Doctors tab (phone/WhatsApp-reported, same pattern
    as a doctor-referral CareRequest) — `logged_by` distinguishes the two.
    """
    __tablename__ = "doctor_consultations"

    id = Column(Integer, primary_key=True, index=True)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)

    occurred_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    note = Column(Text, nullable=True)  # short reason/summary the doctor or concierge desk enters — not a clinical record

    # "doctor_portal" (the doctor logged it themselves) or "admin" (concierge
    # desk logged it on the doctor's behalf, phone/WhatsApp-reported).
    logged_by = Column(String, default="admin", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    membership = relationship("Membership", back_populates="consultations")
    doctor = relationship("Doctor", back_populates="consultations")
