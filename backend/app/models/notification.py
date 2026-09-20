"""
The manual-send notification queue.

No WhatsApp Business API is wired up yet (see app/services/notifications.py),
so every outbound message the app "sends" actually lands here as a row an
admin has to act on: open it in WhatsApp themselves (a wa.me link, prefilled
with the message — see routers/admin.py) and mark it sent once they've
actually tapped Send there. This is a real (if manual) send, not a log —
each row tracks exactly who sent it and when, so it's still a usable audit
trail once a real provider eventually replaces the manual step.
"""
import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class NotificationStatus(str, enum.Enum):
    pending = "pending"    # queued — nobody has sent it yet
    sent = "sent"          # an admin opened WhatsApp and confirmed they sent it
    failed = "failed"      # an admin tried and it didn't go through (bad number, etc.)


class OutboundNotification(Base):
    __tablename__ = "outbound_notifications"

    id = Column(Integer, primary_key=True)
    channel = Column(String, default="whatsapp", nullable=False)  # only "whatsapp" for now; kept open for "sms" later
    recipient_phone = Column(String, nullable=False)
    recipient_label = Column(String, nullable=True)  # e.g. "Apollo Hospital" — so the queue is scannable without a join
    message = Column(Text, nullable=False)
    # A short machine tag for what triggered this (e.g. "hospital_discharge"),
    # so the queue can be filtered/understood without parsing the message text.
    purpose = Column(String, nullable=False)
    patient_case_id = Column(Integer, ForeignKey("patient_cases.id"), nullable=True)

    status = Column(Enum(NotificationStatus), default=NotificationStatus.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    sent_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # which ROSKYRO admin actually sent it
    failure_reason = Column(String, nullable=True)  # set only when marked failed (e.g. "number switched off")

    patient_case = relationship("PatientCase")
    sent_by = relationship("User")
