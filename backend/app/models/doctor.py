"""
Concierge Doctor — the clinical relationship owner in the ROSKYRO Doctor +
Healthcare Concierge Membership.

This is deliberately a separate table from Agent (ROSKYRO's own Relationship
Officers) and from the Partner directory used by Priority Access (a referral
list of outside doctors/hospitals members can request appointments with).
A Doctor here is a doctor ROSKYRO has actually partnered with to be someone's
dedicated concierge physician — assigned 1:1 (well, 1:many, capacity-limited)
to memberships on the doctor_concierge plan, the same way an Agent is
assigned to a PatientCase in the Hospital Concierge Program. See
app/services/doctor_roster.py for the capacity check that mirrors
app/services/officer_roster.py's pattern.
"""
import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base


class DoctorStatus(str, enum.Enum):
    active = "active"        # can be assigned new members
    inactive = "inactive"    # not accepting new members, but existing assignments are untouched


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)
    specialty = Column(String, nullable=True)         # e.g. "Internal Medicine", "Family Physician"
    qualification = Column(String, nullable=True)      # e.g. "MBBS, MD"
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)

    contact_phone = Column(String, nullable=False)
    whatsapp = Column(String, nullable=True)
    email = Column(String, nullable=True)

    # Short concierge-facing description shown to the member on their
    # dashboard ("Dr. Mehta specializes in..."). Not a place for anything
    # about a specific patient's condition.
    bio = Column(Text, nullable=True)

    status = Column(Enum(DoctorStatus), default=DoctorStatus.active, nullable=False)

    # How many concierge memberships this doctor can be the assigned doctor
    # for at once. Mirrors MAX_DAILY_PATIENTS_PER_OFFICER's role for Agents,
    # but this is a standing headcount cap, not a per-day one — the
    # relationship is ongoing (a doctor manages a member's health over the
    # whole membership term), not a daily coverage assignment.
    max_members = Column(Integer, default=40, nullable=False)

    # --- The doctor's own no-login portal link ---
    # Mirrors Agent.portal_token / PatientCase.officer_discharge_token: this
    # build has no doctor login, so a long random, single-purpose link
    # (issued from the admin Doctors tab, see app/services/doctor_roster.py)
    # stands in for one. It opens a page listing this doctor's assigned
    # members, where they can log a consultation or refer a member onward
    # for coordination themselves — see routers/doctor.py. Rotating it mints
    # a fresh token and kills the previous one immediately.
    portal_token = Column(String, unique=True, nullable=True, index=True)
    portal_token_expires_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    city = relationship("City")
    memberships = relationship("Membership", back_populates="assigned_doctor")
    consultations = relationship(
        "DoctorConsultation", back_populates="doctor", cascade="all, delete-orphan"
    )
