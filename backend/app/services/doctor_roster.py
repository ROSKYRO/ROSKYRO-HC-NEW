"""
Everything about assigning a Doctor to a Membership on the doctor_concierge
plan — the doctor-side counterpart to app/services/officer_roster.py, which
does the equivalent job for Agents on the Hospital Concierge Program.

Simpler than the officer case in one respect: a concierge doctor's
relationship with a member is a standing assignment for the length of the
membership, not a day-by-day roster, so there's no daily conflict window to
walk — just "how many members is this doctor already carrying right now".
"""
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import generate_doctor_token
from app.models.doctor import Doctor, DoctorStatus
from app.models.membership import Membership, MembershipStatus


class DoctorAssignmentError(ValueError):
    """Raised when a doctor can't be assigned to a membership as requested.
    Routers turn this into a 400 (hard, no-override — status) or a 409
    (soft, overridable — capacity); see `overridable` below."""

    def __init__(self, message: str, *, overridable: bool = False):
        super().__init__(message)
        self.overridable = overridable


def check_doctor_eligible(doctor: Doctor) -> None:
    """A doctor must be active before being assigned any new member. There is
    deliberately no override for this one — reactivate the doctor first."""
    if doctor.status != DoctorStatus.active:
        raise DoctorAssignmentError(
            f"Dr. {doctor.full_name} is currently '{doctor.status.value}' and isn't "
            f"accepting new members. Set them active first.",
            overridable=False,
        )


def active_member_count(db: Session, doctor_id: int, exclude_membership_id: Optional[int] = None) -> int:
    """How many memberships currently list this doctor as their assigned
    concierge doctor. Cancelled/expired memberships don't count against
    capacity — only pending/active/paused ones, since a paused member can
    resume without a re-assignment step."""
    q = db.query(Membership).filter(
        Membership.assigned_doctor_id == doctor_id,
        Membership.status.in_([MembershipStatus.pending, MembershipStatus.active, MembershipStatus.paused]),
    )
    if exclude_membership_id is not None:
        q = q.filter(Membership.id != exclude_membership_id)
    return q.count()


@dataclass
class CapacityStatus:
    current: int
    max_members: int
    over_capacity: bool


def capacity_status(db: Session, doctor: Doctor) -> CapacityStatus:
    current = active_member_count(db, doctor.id)
    return CapacityStatus(
        current=current,
        max_members=doctor.max_members,
        over_capacity=current >= doctor.max_members,
    )


def check_capacity(db: Session, doctor: Doctor, exclude_membership_id: Optional[int] = None) -> None:
    """Raise an overridable error if assigning one more member would put this
    doctor at or over their configured cap. Admin can still force it through
    (e.g. a doctor briefly over capacity by one while a replacement is
    found) — this is advisory, not a hard block."""
    current = active_member_count(db, doctor.id, exclude_membership_id=exclude_membership_id)
    if current >= doctor.max_members:
        raise DoctorAssignmentError(
            f"Dr. {doctor.full_name} is already assigned to {current} of their "
            f"{doctor.max_members}-member capacity.",
            overridable=True,
        )


# ---------------------------------------------------------------------------
# The doctor's own no-login portal link — mirrors
# officer_roster.issue_portal_token()/portal_token_is_live() exactly, just
# scoped to Doctor instead of Agent. See routers/doctor.py for where the
# token is actually checked.
# ---------------------------------------------------------------------------

def issue_portal_token(doctor: Doctor, rotate: bool = False) -> str:
    if rotate or not doctor.portal_token:
        doctor.portal_token = generate_doctor_token()
    doctor.portal_token_expires_at = datetime.utcnow() + timedelta(days=settings.OFFICER_PORTAL_TOKEN_TTL_DAYS)
    return doctor.portal_token


def portal_token_is_live(doctor: Doctor) -> bool:
    if not doctor.portal_token:
        return False
    if doctor.portal_token_expires_at is None:
        return True
    return datetime.utcnow() <= doctor.portal_token_expires_at
