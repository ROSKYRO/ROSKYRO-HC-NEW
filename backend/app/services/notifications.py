"""
Outbound-notification layer.

No WhatsApp Business API / SMS gateway is wired up yet, so nothing here
actually calls a provider. Instead, queue_whatsapp() writes a row to the
manual-send queue (app/models/notification.OutboundNotification) — an admin
opens it from the ROSKYRO admin console, sends it themselves via a prefilled
wa.me link, and marks it sent (see routers/admin.py). Every call site
elsewhere in the app (see patient_billing.notify_hospital_of_discharge) is
already wired correctly against this function; swapping the manual queue for
a real provider later is a change to THIS file alone.
"""
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.models.notification import OutboundNotification

logger = logging.getLogger("roskyro.notifications")


def queue_whatsapp(
    db: Session,
    *,
    phone: Optional[str],
    message: str,
    purpose: str,
    recipient_label: Optional[str] = None,
    patient_case_id: Optional[int] = None,
) -> Optional[OutboundNotification]:
    """Queue a WhatsApp message for an admin to send manually. Returns the
    queued row (still `pending` — nothing is auto-sent), or None without
    raising when there's no phone number to send to, since a missing
    contact number should never block whatever business flow triggered
    this (see notify_hospital_of_discharge)."""
    if not phone:
        logger.warning("queue_whatsapp: no phone number on file — nothing queued: %s", message)
        return None
    notification = OutboundNotification(
        channel="whatsapp",
        recipient_phone=phone,
        recipient_label=recipient_label,
        message=message,
        purpose=purpose,
        patient_case_id=patient_case_id,
    )
    db.add(notification)
    db.flush()  # so the caller's response can reference notification.id in the same request, before commit
    logger.info("WHATSAPP queued (#%s) -> %s: %s", notification.id, phone, message)
    return notification
