"""
ROSKYRO Concierge — free Relationship Officer-visit quota.

Every membership plan bundles a number of free ROSKYRO Relationship Officer
visits per calendar month (Care: 2, Family: 5, NRI Care: 8 — see the
membership info page). This module is the single place that decides, for a
given membership, how many of those visits have been used in the *current*
monthly cycle and how many remain.

Note: membership billing itself is annual (see PLAN_ANNUAL_PRICE), but the
Relationship Officer visit quota resets every calendar month regardless —
it is NOT tied to the annual invoice period. current_ro_visit_period()
below computes that monthly window, anchored to the day of the month the
membership started on.

Usage against this quota is currently coordinated manually by the
concierge desk (WhatsApp/phone) rather than through a self-serve booking
flow, so `used` is always 0 here for now — every active member simply sees
their full monthly quota. If/when self-serve visit requests are added back,
wire the "used" count up to whatever request model backs them.
"""
from datetime import datetime
from typing import Tuple

from app.models.membership import (
    Membership, MembershipStatus, PLAN_FREE_ASSIST_VISITS,
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
    is always 0 and `remaining` always equals the plan's quota."""
    quota = PLAN_FREE_ASSIST_VISITS.get(membership.plan, 0)
    period_start, period_end = current_ro_visit_period(membership)

    return {
        "quota": quota,
        "used": 0,
        "remaining": quota,
        "period_start": period_start,
        "period_end": period_end,
    }


def has_quota_remaining(membership: Membership) -> bool:
    """False for any non-active membership (paused/expired/cancelled/pending)
    — quota only applies while the membership is actually active."""
    if membership.status != MembershipStatus.active:
        return False
    return relationship_officer_quota_status(membership)["remaining"] > 0
