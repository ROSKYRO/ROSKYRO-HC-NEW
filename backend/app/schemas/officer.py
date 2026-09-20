from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from app.schemas.utc_types import UTCDateTime

from app.models.patient_case import PatientCaseStatus


# ---------------------------------------------------------------------------
# Hospital patient-case discharge — the assigned Relationship Officer's side
# of the dual discharge confirmation, via their own no-login token link.
# ---------------------------------------------------------------------------

class OfficerPatientCaseOut(BaseModel):
    """What the assigned officer's no-login discharge page shows them — just
    enough to confirm they're looking at the right patient, nothing about
    hospital billing."""
    patient_name: str
    hospital_name: Optional[str] = None
    admission_date: date
    status: PatientCaseStatus
    hospital_discharge_at: Optional[UTCDateTime] = None  # legacy/admin-manual only — not part of normal flow
    officer_discharge_at: Optional[UTCDateTime] = None   # set once this officer has confirmed
    waiting_on: Optional[str] = None                  # always None now (single-sided confirmation)
    link_expires_at: Optional[UTCDateTime] = None        # when this link stops working


class OfficerDischargeIn(BaseModel):
    """The officer's discharge confirmation — the sole confirmation that
    closes a Hospital Concierge Program case (see app/services/
    patient_billing.py). A photo is required as proof, since the Hospital
    Console no longer confirms discharge itself, but the photo itself is NOT
    uploaded through this endpoint any more: the officer takes it, shares it
    on WhatsApp, someone manually saves it to ROSKYRO's Google Drive, and
    photo_url is just that Drive share link (keeps Postgres/backups light —
    no more base64 image blobs in the database). GPS is included when the
    browser granted location access (never required — degrades gracefully to
    link + timestamp only). discharge_datetime defaults to right now if
    omitted."""
    discharge_datetime: Optional[UTCDateTime] = None
    photo_url: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class OfficerDischargeOut(BaseModel):
    status: PatientCaseStatus
    message: str


# ---------------------------------------------------------------------------
# The officer's own no-login "my day" portal — everything this officer is
# covering right now, across every hospital, in one place. Previously an
# officer had no way to see this themselves; only a per-case discharge link.
# ---------------------------------------------------------------------------

class OfficerPortalCaseOut(BaseModel):
    """One case this officer is currently on. Deliberately as light as the
    other officer-facing schemas — no billing, no attendant contact details
    beyond what they'd need to find the right patient."""
    patient_name: str
    hospital_name: Optional[str] = None
    ward_or_room: Optional[str] = None
    admission_date: date
    status: PatientCaseStatus
    covering_today: bool
    hospital_discharge_at: Optional[UTCDateTime] = None
    officer_discharge_at: Optional[UTCDateTime] = None
    discharge_link_token: Optional[str] = None  # this case's own discharge-confirmation link


class OfficerPortalOut(BaseModel):
    full_name: str
    today_patient_count: int
    cases: List[OfficerPortalCaseOut] = []
