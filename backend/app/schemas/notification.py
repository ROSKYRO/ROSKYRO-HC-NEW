from typing import Optional
from urllib.parse import quote

from pydantic import BaseModel, computed_field

from app.models.notification import NotificationStatus
from app.schemas.utc_types import UTCDateTime


class NotificationOut(BaseModel):
    id: int
    channel: str
    recipient_phone: str
    recipient_label: Optional[str] = None
    message: str
    purpose: str
    patient_case_id: Optional[int] = None
    status: NotificationStatus
    created_at: UTCDateTime
    sent_at: Optional[UTCDateTime] = None
    sent_by_name: Optional[str] = None
    failure_reason: Optional[str] = None

    @computed_field
    @property
    def wa_link(self) -> str:
        """A wa.me link, prefilled with the message, for the admin doing the
        manual send — just strip everything but digits (wa.me wants a bare
        country code + number, no +/spaces/dashes) and URL-encode the text."""
        digits = "".join(ch for ch in self.recipient_phone if ch.isdigit())
        return f"https://wa.me/{digits}?text={quote(self.message)}"

    class Config:
        from_attributes = True


class MarkNotificationFailedIn(BaseModel):
    reason: str
