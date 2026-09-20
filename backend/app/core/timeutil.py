"""
Timestamp conventions — read this before adding a datetime column or field.

STORAGE: every DateTime column holds *naive UTC* (the app writes them with
`datetime.utcnow()`, and any timezone-aware value coming in from a client is
converted to naive UTC first — see `as_naive_utc`).

WIRE FORMAT: a naive datetime serialised as "2026-09-19T09:20:00" carries no
timezone, and browsers read that as the *viewer's local time*. For a UTC value
that is wrong by the viewer's offset (5h30m for India: every admin-panel
timestamp, the customer's live visit timer, "discharged at" shown to hospitals).
So every UTC datetime the API returns goes out as ISO-8601 *with a trailing Z*
("2026-09-19T09:20:00.000Z"), which `new Date(...)` parses correctly everywhere.
Response schemas get this by typing the field as `UTCDateTime`
(app/schemas/types.py) rather than plain `datetime`.

The one deliberate exception is a "wall-clock" time the user typed and that is
never compared to `utcnow()` — e.g. TransportRequest.requested_time, which the
member picks on a `datetime-local` input and which round-trips exactly as typed.
That field stays a plain `datetime`.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

# India has no daylight saving, so a fixed offset is exact. Used only for text
# ROSKYRO composes itself (e.g. the hospital's discharge notification), where
# there is no browser to localise the time for us.
IST = timezone(timedelta(hours=5, minutes=30), name="IST")


def as_naive_utc(value: datetime) -> datetime:
    """Aware -> converted to UTC, tzinfo dropped. Naive -> returned unchanged
    (the app-wide convention is that a naive value already IS UTC)."""
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def to_iso_z(value: datetime) -> str:
    """Naive-UTC (or aware) datetime -> '2026-09-19T09:20:00.123Z'. Millisecond
    precision on purpose: some browsers choke on 6 fractional digits."""
    return as_naive_utc(value).isoformat(timespec="milliseconds") + "Z"


def format_ist(value: Optional[datetime], fmt: str = "%d %b %Y, %H:%M") -> str:
    """Naive-UTC datetime -> 'dd Mon yyyy, HH:MM IST' for human-readable text."""
    if value is None:
        return ""
    aware = as_naive_utc(value).replace(tzinfo=timezone.utc).astimezone(IST)
    return f"{aware.strftime(fmt)} IST"
