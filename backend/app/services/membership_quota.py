"""
ROSKYRO Concierge — free Relationship Officer-visit quota.

Every membership plan bundles a number of free ROSKYRO Relationship Officer
visits per calendar month (Care: 2, Family: 5, NRI Care: 8 — see the
membership info page). This module is the single place that decides, for a
given membership, how many of those visits have been used in the *current*
monthly cycle and how many remain.

Note: membership billing itself is annual, at a price agreed per-member on
the inquiry call (there's no fixed plan price — see
models/membership.py/MembershipInquiry), but the Relationship Officer visit
quota resets every calendar month regardless — it is NOT tied to the annual
invoice period. current_ro_visit_period() below computes that monthly
window, anchored to the day of the month the membership started on.

Usage against the Relationship Officer visit quota is still coordinated
manually by the concierge desk (WhatsApp/phone) rather than through a
self-serve booking flow, so `used` is always 0 for
relationship_officer_quota_status() below — every active member simply
sees their full monthly quota. If/when self-serve visit requests are added
back, wire the "used" count up to whatever request model backs them.

The doctor_concierge plan's annual DOCTOR CONSULTATION allowance
(doctor_consultation_quota_status() below) is different in two ways: its
quota is None (unlimited, fair-use — see PLAN_DOCTOR_CONSULTATIONS_PER_YEAR
in models/membership.py), and `used` counts real logged consultations
(models.membership.DoctorConsultation), written either by the doctor
themselves through their no-login portal (routers/doctor.py) or by the
concierge desk on the doctor's behalf (admin Doctors tab).
"""
from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.models.membership import (
    Membership, MembershipStatus, PLAN_FREE_ASSIST_VISITS, PLAN_DOCTOR_CONSULTATIONS_PER_YEAR,
    PLAN_FAIR_USE_SOFT_THRESHOLD_VISITS, PLAN_FAIR_USE_SOFT_THRESHOLD_CONSULTATIONS,
    DoctorConsultation,
)


def _safe_replace(dt: datetime, year: int, month: int, day: int) -> datetime:
    """dt.replace(), clamping day to the last valid day of the target month
    (e.g. an anchor day of 31 falling in a 30-day, or February, month)."""
    while day > 1:
        try:
            return dt.replace(year=year, month=month, day=day)
        except ValueError:
            day -= 1
    return dt.replace(year=year, month=month, day=1)


def current_ro_visit_period(membership: Membership) -> Tuple[datetime, datetime]:
    """The current monthly window for the Relationship Officer visit quota,
    anchored to the day-of-month the membership started on (so a mid-month
    signup still gets a full month before the first reset)."""
    now = datetime.utcnow()
    anchor_day = membership.started_at.day if membership.started_at else now.day

    period_start = _safe_replace(now, now.year, now.month, anchor_day)
    if period_start > now:
        # This month's anchor date hasn't happened yet -> the current window
        # started last month.
        prev_month = now.month - 1 or 12
        prev_year = now.year - 1 if now.month == 1 else now.year
        period_start = _safe_replace(now, prev_year, prev_month, anchor_day)

    next_month = period_start.month + 1
    next_year = period_start.year + (1 if next_month > 12 else 0)
    next_month = next_month if next_month <= 12 else 1
    period_end = _safe_replace(period_start, next_year, next_month, anchor_day)

    return period_start, period_end


def relationship_officer_quota_status(membership: Membership) -> dict:
    """Plan quota for the current monthly cycle. Usage is coordinated
    manually by the concierge desk today (see module docstring), so `used`
    is always 0 and `remaining` always equals the plan's quota.

    A None quota (currently only doctor_concierge) means unlimited — see
    the PLAN_FREE_ASSIST_VISITS docstring in models/membership.py. `used`
    isn't tracked here yet (see module docstring), so `usage_flag` can't be
    computed from real numbers and is always False for now; it exists on
    the return shape so the unlimited RO-visit quota and the unlimited
    doctor-consultation quota below look the same on the wire."""
    quota = PLAN_FREE_ASSIST_VISITS.get(membership.plan, 0)
    unlimited = quota is None
    period_start, period_end = current_ro_visit_period(membership)

    return {
        "quota": quota,
        "used": 0,
        "remaining": None if unlimited else quota,
        "unlimited": unlimited,
        "usage_flag": False,
        "fair_use_threshold": PLAN_FAIR_USE_SOFT_THRESHOLD_VISITS.get(membership.plan) if unlimited else None,
        "period_start": period_start,
        "period_end": period_end,
    }


def has_quota_remaining(membership: Membership) -> bool:
    """False for any non-active membership (paused/expired/cancelled/pending)
    — quota only applies while the membership is actually active. Always
    True for an unlimited (None-quota) plan."""
    if membership.status != MembershipStatus.active:
        return False
    status = relationship_officer_quota_status(membership)
    if status["unlimited"]:
        return True
    return status["remaining"] > 0


def current_doctor_consultation_period(membership: Membership) -> Tuple[datetime, datetime]:
    """The current annual window the doctor-consultation allowance resets
    on — anchored to the membership's own annual billing cycle
    (next_billing_date), unlike the Relationship Officer visit quota above,
    which resets monthly. period_end is next_billing_date itself (or, if
    that isn't set yet — e.g. a pending membership with no paid invoice —
    one year out from started_at, so a brand-new signup still has a sane
    window to count consultations against). period_start is exactly one
    year before period_end."""
    from datetime import timedelta
    period_end = membership.next_billing_date or (
        (membership.started_at or datetime.utcnow()) + timedelta(days=365)
    )
    period_start = period_end - timedelta(days=365)
    return period_start, period_end


def doctor_consultation_quota_status(membership: Membership, db: Optional[Session] = None) -> dict:
    """The doctor_concierge plan's annual consultation allowance
    (PLAN_DOCTOR_CONSULTATIONS_PER_YEAR) — resets on the membership's own
    annual billing cycle (next_billing_date), unlike the Relationship
    Officer visit quota above, which resets monthly.

    `used` reflects real logged consultations (see
    models.membership.DoctorConsultation) within the current annual window.
    For a plan with a numeric cap, `remaining = quota - used` and nothing
    else changes. For a None (unlimited) quota — currently only
    doctor_concierge — `remaining` is also None, and `usage_flag` becomes
    True once `used` crosses that plan's PLAN_FAIR_USE_SOFT_THRESHOLD_CONSULTATIONS.
    The flag is purely informational: nothing in this codebase blocks a
    consultation from being logged because of it. Pass `db` to get the real
    count; omitting it falls back to `used=0` (and so `usage_flag=False`),
    so every existing call site keeps working even if not yet updated to
    pass a session."""
    quota = PLAN_DOCTOR_CONSULTATIONS_PER_YEAR.get(membership.plan, 0)
    unlimited = quota is None
    period_start, period_end = current_doctor_consultation_period(membership)

    used = 0
    if db is not None:
        used = db.query(DoctorConsultation).filter(
            DoctorConsultation.membership_id == membership.id,
            DoctorConsultation.occurred_at >= period_start,
            DoctorConsultation.occurred_at <= period_end,
        ).count()

    threshold = PLAN_FAIR_USE_SOFT_THRESHOLD_CONSULTATIONS.get(membership.plan) if unlimited else None

    return {
        "quota": quota,
        "used": used,
        "remaining": None if unlimited else max(quota - used, 0),
        "unlimited": unlimited,
        "usage_flag": bool(unlimited and threshold is not None and used >= threshold),
        "fair_use_threshold": threshold,
        "period_start": period_start,
        "period_end": period_end,
    }
