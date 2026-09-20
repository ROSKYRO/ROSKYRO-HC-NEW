"""
Coverage-day / billing math, the discharge confirmation rules, and the ops
alerts for a PatientCase — shared by app/routers/hospital_admin.py (ROSKYRO
Admin), app/routers/hospitals.py (Hospital Console) and app/routers/officer.py
(the assigned Relationship Officer's no-login discharge link), so the three
surfaces can never quietly disagree on "how many days has this cost so far",
"who is covering this patient today", or "is this case actually discharged".

Design, per the ops rule this implements:
  - The Relationship Officer is assigned once (ROSKYRO Admin picks them from
    the dropdown, at admission). Coverage is NOT capped by whatever date
    range Admin happened to type into the "To" field when assigning — that
    range only seeds DailyOfficerAssignment rows for the history view.
    `officer_on_duty()` below therefore falls back to the case's assigned
    officer on any day that has no daily row, instead of reporting the
    patient as uncovered.
  - Time (and therefore billing) keeps running, day by day, for as long as
    the case is active — right up until the patient is actually discharged.
  - "Actually discharged" is confirmed by the assigned Relationship Officer
    ALONE (with a timestamped, geotagged photo as proof) — the Hospital
    Console has no confirm action any more. The one exception: a case that
    never had an officer assigned has nobody who can confirm at all, so an
    admin-recorded hospital_discharge_at (a manual escape hatch, not
    self-serve) closes it instead — otherwise it would bill forever with no
    possible way out.
  - Because the officer is ROSKYRO's own employee, this is a genuine
    conflict-of-interest risk (their payout is tied to days covered), so two
    independent checks sit on top of their confirmation instead of a second
    human confirmation: the photo proof above, and notify_hospital_of_
    discharge() below, which pings the hospital's contact number the moment
    a case closes and gives them HOSPITAL_DISCHARGE_DISPUTE_WINDOW_HOURS to
    object (apply_hospital_dispute()) before it's treated as settled.
  - When the officer never responds, ROSKYRO Admin can force the case
    closed — recorded separately (who/when/why) so it is never mistaken for
    a clean officer confirmation.
"""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone, date as date_cls
from typing import Optional

from app.core.config import settings
from app.core.timeutil import format_ist
from app.core.security import generate_officer_token
from app.models.patient_case import PatientCase, PatientCaseStatus


class DischargeValidationError(ValueError):
    """Raised when a confirmed discharge date/time can't be accepted. Routers
    translate this into a 400 with the message as-is — the messages here are
    written to be shown to hospital staff and officers directly."""


# ---------------------------------------------------------------------------
# Timezone hygiene
# ---------------------------------------------------------------------------

def to_naive_utc(value: Optional[datetime]) -> Optional[datetime]:
    """Every datetime stored on a PatientCase is naive UTC (the rest of the
    app uses `datetime.utcnow()`), but the browser posts ISO strings ending in
    'Z', which FastAPI parses into *timezone-aware* datetimes. Mixing the two
    blows up on the very first comparison — e.g. `max(hospital_discharge_at,
    officer_discharge_at)` raises TypeError when one side sent an explicit
    time and the other defaulted to utcnow(). Normalize on the way in, once."""
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


# ---------------------------------------------------------------------------
# Coverage / billing
# ---------------------------------------------------------------------------

def coverage_days_and_billing(case: PatientCase) -> tuple[int, float]:
    """How many calendar days this case has been (or was) covered, and the
    running/final billed estimate — counted from admission_date through
    today (still open) or through the confirmed discharge date (closed),
    inclusive on both ends, minimum of 1 day."""
    if case.status == PatientCaseStatus.discharged and case.discharged_at:
        end = case.discharged_at.date()
    else:
        end = datetime.utcnow().date()
    days = max((end - case.admission_date).days + 1, 1)
    return days, round(days * case.daily_rate, 2)


# ---------------------------------------------------------------------------
# Who is on this patient today
# ---------------------------------------------------------------------------

@dataclass
class OnDutyOfficer:
    agent_id: Optional[int]
    name: Optional[str]
    # True when this came from the case's standing assignment rather than an
    # explicit DailyOfficerAssignment row for that date. Not a problem — it is
    # the normal state once the seeded From–To range runs out — but the UI
    # labels it so Admin can tell "covered by the standing assignment" apart
    # from "explicitly rostered for today".
    is_fallback: bool = False
    # Today's row was explicitly marked no_show — the patient is uncovered
    # *and* somebody has already noticed, which is a different alert from
    # "nobody was ever assigned".
    no_show: bool = False

    @property
    def covered(self) -> bool:
        return self.agent_id is not None


def officer_on_duty(case: PatientCase, day: Optional[date_cls] = None) -> OnDutyOfficer:
    """Who is covering this patient on `day` (default: today).

    Resolution order:
      1. An explicit DailyOfficerAssignment row for that date (unless it was
         marked no_show — that day genuinely needs a re-assign).
      2. The case's standing assigned Relationship Officer.

    Step 2 is the fix for the "To date ran out" false alarm: Admin assigning
    17→18 Sep only seeds two daily rows, but per the ops rule that officer
    stays on the case until discharge — so on 25 Sep the patient is still
    covered, and neither the ops board nor the Hospital Console should be
    shouting "needs today's officer"."""
    from app.models.patient_case import DailyAssignmentStatus  # local: avoids import cycle

    day = day or datetime.utcnow().date()
    row = next((a for a in case.assignments if a.date == day), None)
    if row and row.status == DailyAssignmentStatus.no_show:
        # An explicit no_show is a deliberate statement that this day was NOT
        # covered. It must not fall through to the standing officer below —
        # that's the very person who didn't turn up, and the whole point of
        # marking it is to make the ops board ask for a re-assign.
        return OnDutyOfficer(agent_id=None, name=None, is_fallback=False, no_show=True)
    if row and row.agent:
        return OnDutyOfficer(agent_id=row.agent_id, name=row.agent.full_name, is_fallback=False)
    if case.assigned_agent_id and case.assigned_agent:
        return OnDutyOfficer(
            agent_id=case.assigned_agent_id,
            name=case.assigned_agent.full_name,
            is_fallback=True,
        )
    return OnDutyOfficer(agent_id=None, name=None, is_fallback=False)


# ---------------------------------------------------------------------------
# The officer's no-login discharge link
# ---------------------------------------------------------------------------

def issue_officer_discharge_token(case: PatientCase, rotate: bool = False) -> str:
    """Mint (or rotate) the officer's discharge link and set its expiry.

    `rotate=True` mints a brand-new token, which instantly invalidates the old
    one — used when the link may have leaked, or when the case's officer
    changes and the previous officer must lose access."""
    if rotate or not case.officer_discharge_token:
        case.officer_discharge_token = generate_officer_token()
    case.officer_discharge_token_expires_at = (
        datetime.utcnow() + timedelta(days=settings.OFFICER_DISCHARGE_LINK_TTL_DAYS)
    )
    return case.officer_discharge_token


def officer_discharge_link_is_live(case: PatientCase) -> bool:
    """A NULL expiry means the link predates expiry support — still honoured,
    so nothing breaks for links already handed out in production, but
    `build_case_alerts()` flags it so Admin can rotate it."""
    if not case.officer_discharge_token:
        return False
    if case.officer_discharge_token_expires_at is None:
        return True
    return datetime.utcnow() <= case.officer_discharge_token_expires_at


# ---------------------------------------------------------------------------
# Discharge confirmation
# ---------------------------------------------------------------------------

def requires_officer_confirmation(case: PatientCase) -> bool:
    """A case can only be closed by the officer's confirmation if there IS an
    assigned officer. No officer was ever assigned -> nobody can ever confirm
    -> an admin-recorded hospital_discharge_at (manual escape hatch, not
    self-serve -- see recompute_discharge_status) has to be enough."""
    return case.assigned_agent_id is not None


def validate_discharge_datetime(
    case: PatientCase,
    when: Optional[datetime],
    *,
    enforce_gap: bool = True,
) -> datetime:
    """Normalize and sanity-check a confirmed discharge date/time.

    Rejects: before admission, in the future (beyond clock-skew tolerance).
    `enforce_gap` is currently unused by any caller (kept as a parameter,
    not removed -- force_close_discharge historically passed
    enforce_gap=False when resolving a hospital/officer disagreement, now
    moot with single-sided confirmation, but harmless to leave)."""
    when = to_naive_utc(when) or datetime.utcnow()
    now = datetime.utcnow()

    admission_start = datetime.combine(case.admission_date, datetime.min.time())
    if when < admission_start:
        raise DischargeValidationError(
            f"The discharge time can't be before the patient was admitted "
            f"({case.admission_date.isoformat()}). Please check the date."
        )

    tolerance = timedelta(minutes=settings.DISCHARGE_FUTURE_TOLERANCE_MINUTES)
    if when > now + tolerance:
        raise DischargeValidationError(
            "The discharge time can't be in the future -- confirm it once the "
            "patient has actually been discharged."
        )
    return when


def apply_officer_discharge_confirmation(
    case: PatientCase,
    when: Optional[datetime],
    *,
    photo_url: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> None:
    """The assigned Relationship Officer confirms the discharge date/time via
    their no-login token link -- this alone closes the case (no hospital
    confirmation needed any more). photo_url is the officer's timestamped
    proof photo, shared manually on WhatsApp and saved to ROSKYRO's Google
    Drive -- only that Drive share link is stored here (validated by the
    router before this is called), never the photo itself."""
    case.officer_discharge_at = validate_discharge_datetime(case, when)
    if photo_url:
        case.discharge_photo_url = photo_url
        case.discharge_photo_at = datetime.utcnow()
    case.discharge_lat = lat
    case.discharge_lng = lng
    recompute_discharge_status(case)


def undo_officer_discharge_confirmation(case: PatientCase) -> None:
    """The officer takes back a confirmation given by mistake. Unlike the old
    dual-confirmation model, confirming now closes the case immediately (see
    recompute_discharge_status) — so status==discharged can't be the "too
    late" guard any more, or a fat-fingered confirm could never be undone.
    The real boundary is invoicing: once a case has been swept into a
    HospitalInvoice, undoing would corrupt a bill that's already gone out,
    so from that point it's an Admin decision, not a one-click undo. Clears
    the photo proof and any hospital notify/dispute state too, so a later
    re-confirmation notifies the hospital fresh rather than looking like it
    already did."""
    if case.invoice_id is not None:
        raise DischargeValidationError(
            "This case has already been invoiced — ask ROSKYRO to reopen it."
        )
    # recompute_discharge_status() credits the officer one completed job when a
    # case moves INTO discharged. Undoing moves it back OUT, so take that
    # credit back — otherwise undo -> re-confirm would count the same case twice.
    was_discharged = case.status == PatientCaseStatus.discharged
    case.officer_discharge_at = None
    case.discharge_photo_base64 = None  # legacy field — cleared too, just in case an old row still had it
    case.discharge_photo_url = None
    case.discharge_photo_at = None
    case.discharge_lat = None
    case.discharge_lng = None
    case.hospital_notified_at = None
    case.hospital_dispute_deadline = None
    case.hospital_disputed_at = None
    case.hospital_dispute_note = None
    recompute_discharge_status(case)
    if was_discharged and case.status != PatientCaseStatus.discharged and case.assigned_agent is not None:
        case.assigned_agent.total_jobs = max((case.assigned_agent.total_jobs or 0) - 1, 0)


# ---------------------------------------------------------------------------
# Hospital notify + dispute window -- replaces the hospital's old in-app
# confirmation. The hospital's ONLY touchpoint on a discharge: an outbound
# ping, and a window to object if it's wrong. No login, no click needed
# unless something actually is wrong.
# ---------------------------------------------------------------------------

def notify_hospital_of_discharge(db, case: PatientCase) -> None:
    """Call once, right after a case's status has become `discharged` via the
    officer's confirmation. Queues a WhatsApp message to the hospital's
    registered contact number for a ROSKYRO admin to actually send (see
    app/services/notifications.queue_whatsapp — no auto-send provider is
    wired up yet), and opens the dispute window regardless of whether a
    phone number was on file to queue it against."""
    from app.services.notifications import queue_whatsapp  # local: avoids import cycle

    case.hospital_notified_at = datetime.utcnow()
    case.hospital_dispute_deadline = case.hospital_notified_at + timedelta(
        hours=settings.HOSPITAL_DISCHARGE_DISPUTE_WINDOW_HOURS
    )
    hospital_phone = case.hospital.contact_phone if case.hospital else None
    # discharged_at is naive UTC; the hospital reads this on WhatsApp in India,
    # so show IST (with the label) instead of a raw UTC clock time.
    when_str = format_ist(case.discharged_at) if case.discharged_at else "just now"
    queue_whatsapp(
        db,
        phone=hospital_phone,
        recipient_label=case.hospital.name if case.hospital else None,
        purpose="hospital_discharge",
        patient_case_id=case.id,
        message=(
            f"ROSKYRO: Patient {case.patient_name}"
            f"{f' ({case.ward_or_room})' if case.ward_or_room else ''} was discharged, "
            f"confirmed by our Relationship Officer at {when_str}. If this is "
            f"incorrect, please let ROSKYRO know within "
            f"{settings.HOSPITAL_DISCHARGE_DISPUTE_WINDOW_HOURS} hours."
        ),
    )


def hospital_dispute_window_open(case: PatientCase) -> bool:
    if not case.hospital_dispute_deadline:
        return False
    return datetime.utcnow() <= case.hospital_dispute_deadline


def apply_hospital_dispute(case: PatientCase, note: str) -> None:
    """The hospital's one legitimate write action on a discharge: flag that
    it looks wrong, within the dispute window, with a reason. Does NOT reopen
    the case automatically -- a disputed discharge needs a human (ROSKYRO
    Admin) to actually look at it; this just raises the flag and stops the
    same discharge being disputed twice."""
    if case.status != PatientCaseStatus.discharged:
        raise DischargeValidationError("Only a discharged case can be disputed.")
    if case.hospital_disputed_at:
        raise DischargeValidationError(
            "This discharge has already been disputed -- ROSKYRO is reviewing it."
        )
    if not hospital_dispute_window_open(case):
        raise DischargeValidationError(
            f"The {settings.HOSPITAL_DISCHARGE_DISPUTE_WINDOW_HOURS}-hour window to "
            f"dispute this discharge has passed -- contact ROSKYRO directly."
        )
    if not (note or "").strip():
        raise DischargeValidationError("Please describe what's wrong before submitting a dispute.")
    case.hospital_disputed_at = datetime.utcnow()
    case.hospital_dispute_note = note.strip()


def force_close_discharge(
    case: PatientCase,
    when: Optional[datetime],
    admin_id: Optional[int],
    reason: str,
) -> None:
    """ROSKYRO Admin's override for a case stuck open because the officer
    never responded (lost their phone, left the job — there is no hospital
    side to wait on any more). Fills in the officer confirmation (or, when no
    officer was ever assigned, the legacy hospital_discharge_at field) at the
    given time, closes the case so billing stops, and records who overrode
    it and why — a force-closed case is deliberately distinguishable from a
    clean officer confirmation in every read model. Does NOT notify the
    hospital via notify_hospital_of_discharge() — that's the router's job,
    same as a normal officer confirmation, so both paths behave identically
    from the hospital's side."""
    if case.status == PatientCaseStatus.cancelled:
        raise DischargeValidationError("This case was cancelled — there's nothing to discharge.")
    if case.status == PatientCaseStatus.discharged:
        raise DischargeValidationError("This case is already fully discharged.")
    if not (reason or "").strip():
        raise DischargeValidationError("A reason is required when force-closing a discharge.")

    resolved = validate_discharge_datetime(case, when, enforce_gap=False)

    if requires_officer_confirmation(case):
        if not case.officer_discharge_at:
            case.officer_discharge_at = resolved
    elif not case.hospital_discharge_at:
        case.hospital_discharge_at = resolved

    case.discharge_force_closed_at = datetime.utcnow()
    case.discharge_force_closed_by_id = admin_id
    case.discharge_force_close_reason = reason.strip()

    # Kill the officer's link — the case is closed, so it has no further use.
    case.officer_discharge_token_expires_at = datetime.utcnow()

    recompute_discharge_status(case)


def recompute_discharge_status(case: PatientCase) -> None:
    """Single source of truth for status + discharged_at, derived from which
    confirmation is currently on the record. Written as a pure recompute
    (rather than one-way transitions) so that undoing a confirmation, or
    resetting the officer's side after a re-assign, lands the case back in
    exactly the right state instead of leaving it stranded.

    The officer's confirmation (officer_discharge_at) is now the only normal
    way to close a case. hospital_discharge_at is a legacy/admin-manual
    field: it only closes a case on its own when there was never an officer
    to confirm in the first place (requires_officer_confirmation() is False)
    — otherwise it's informational only and does not affect status.

    Also the single place a finished Hospital Concierge Program case counts
    as a completed job for the assigned officer — total_jobs previously only
    ever moved from the on-demand booking flow, so an officer who spent 30
    days on a hospital patient had nothing to show for it on their own
    record. Every path that can close a case (officer confirms, admin
    force-closes) funnels through here, so the increment only needs to live
    in one place, and only fires on the transition INTO discharged (never
    twice for the same case, since undo is blocked once a case is already
    discharged — see undo_officer_discharge_confirmation above)."""
    if case.status == PatientCaseStatus.cancelled:
        return

    was_discharged = case.status == PatientCaseStatus.discharged
    officer_at = case.officer_discharge_at
    hospital_at = case.hospital_discharge_at
    officer_needed = requires_officer_confirmation(case)

    if officer_at or (hospital_at and not officer_needed):
        case.status = PatientCaseStatus.discharged
        case.discharged_at = officer_at or hospital_at
        if not was_discharged and case.assigned_agent is not None:
            case.assigned_agent.total_jobs = (case.assigned_agent.total_jobs or 0) + 1
    else:
        case.status = PatientCaseStatus.active
        case.discharged_at = None


def discharge_waiting_on(case: PatientCase) -> Optional[str]:
    """Kept for API/schema compatibility (PatientCaseOut still has this
    field) — but with single-sided confirmation a case is never left
    half-confirmed any more, so this is always None in normal operation."""
    return None


def discharge_pending_since(case: PatientCase) -> Optional[datetime]:
    """When the first (so far unanswered) confirmation landed."""
    if case.status != PatientCaseStatus.pending_discharge:
        return None
    stamps = [t for t in (case.hospital_discharge_at, case.officer_discharge_at) if t]
    return min(stamps) if stamps else None


# ---------------------------------------------------------------------------
# Ops alerts — the in-app stand-in for push notifications
# ---------------------------------------------------------------------------

@dataclass
class CaseAlert:
    code: str
    severity: str   # info | warning | critical
    message: str


def build_case_alerts(case: PatientCase, *, for_admin: bool = False) -> list[CaseAlert]:
    """Everything about this case that somebody should be chasing right now.

    This is what both dashboards render, so neither side has to notice a
    problem by reading timestamps. It is NOT a delivery channel — nobody gets
    an SMS/WhatsApp from this. Wiring these same alerts into a real notifier
    is a separate job (see the note in the handover doc); surfacing them in
    the UI is the part that needs no third-party provider."""
    alerts: list[CaseAlert] = []
    now = datetime.utcnow()
    today = now.date()

    if case.status == PatientCaseStatus.cancelled:
        return alerts

    if case.status == PatientCaseStatus.discharged:
        # A discharged case is otherwise done — the one thing still worth
        # surfacing to Admin is the hospital having disputed it within its
        # window (see apply_hospital_dispute in patient_billing.py).
        if for_admin and case.hospital_disputed_at:
            alerts.append(CaseAlert(
                code="hospital_disputed_discharge",
                severity="critical",
                message=(
                    f"The hospital disputed this discharge: "
                    f"\"{case.hospital_dispute_note}\" — needs ROSKYRO review."
                ),
            ))
        return alerts

    on_duty = officer_on_duty(case)
    if on_duty.no_show:
        alerts.append(CaseAlert(
            code="officer_no_show",
            severity="critical",
            message="Today's officer was marked a no-show — this patient is uncovered right now. Re-assign someone.",
        ))
    elif not on_duty.covered:
        alerts.append(CaseAlert(
            code="no_officer_assigned",
            severity="critical" if case.status == PatientCaseStatus.active else "warning",
            message="No Relationship Officer is assigned to this patient yet.",
        ))

    if (
        case.status == PatientCaseStatus.active
        and case.expected_discharge_date
        and case.expected_discharge_date < today
    ):
        overdue = (today - case.expected_discharge_date).days
        alerts.append(CaseAlert(
            code="expected_discharge_passed",
            severity="warning" if overdue >= 2 else "info",
            message=(
                f"Expected discharge was {overdue} day{'s' if overdue != 1 else ''} ago "
                f"({case.expected_discharge_date.isoformat()}) and this case is still open. "
                f"Check whether the patient has actually gone home."
            ),
        ))

    if for_admin and requires_officer_confirmation(case):
        if not officer_discharge_link_is_live(case):
            alerts.append(CaseAlert(
                code="discharge_link_expired",
                severity="warning",
                message="The officer's discharge link has expired — regenerate it before they need to confirm.",
            ))
        elif case.officer_discharge_token_expires_at is None:
            alerts.append(CaseAlert(
                code="discharge_link_no_expiry",
                severity="info",
                message="This officer link was issued before links expired. Regenerate it to put it on a timer.",
            ))

    return alerts
