from datetime import date
from app.schemas.utc_types import UTCDateTime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.hospital_invoice import HospitalInvoiceStatus, HospitalPaymentMethod


class GenerateInvoiceIn(BaseModel):
    """Admin generates an invoice for a hospital. Both dates are just a
    descriptive label for the run (defaults to the current calendar month) —
    they do NOT filter which cases get swept in; see
    services/hospital_billing.py for why."""
    period_start: Optional[date] = None
    period_end: Optional[date] = None


class InvoiceCaseOut(BaseModel):
    """One patient case included in an invoice — enough for the hospital to
    recognise and cross-check it, no attendant contact details."""
    case_id: int
    patient_name: str
    admission_date: date
    discharged_at: Optional[UTCDateTime] = None
    days_covered: int
    amount: float


class HospitalInvoiceOut(BaseModel):
    id: int
    hospital_id: int
    hospital_name: Optional[str] = None
    period_start: date
    period_end: date
    case_count: int
    total_amount: float
    status: HospitalInvoiceStatus
    generated_at: UTCDateTime
    paid_at: Optional[UTCDateTime] = None
    payment_reference: Optional[str] = None
    payment_note: Optional[str] = None
    # What the hospital itself declared from its own read-only console,
    # before ROSKYRO admin verified and marked it paid (fields above).
    reported_payment_method: Optional[HospitalPaymentMethod] = None
    reported_payment_reference: Optional[str] = None
    reported_payment_note: Optional[str] = None
    reported_at: Optional[UTCDateTime] = None
    cases: List[InvoiceCaseOut] = []


class MarkInvoicePaidIn(BaseModel):
    payment_reference: Optional[str] = Field(None, max_length=100)
    payment_note: Optional[str] = Field(None, max_length=500)


class ReportInvoicePaymentIn(BaseModel):
    """The Hospital Console's one billing write action: declare a payment
    made by cheque, netbanking, UPI or cash. This does NOT mark the invoice
    paid by itself — it moves it to `payment_reported` so ROSKYRO admin knows
    a claim is waiting, then verifies (against the bank/cheque/UPI records)
    and marks it paid."""
    method: HospitalPaymentMethod
    reference: Optional[str] = Field(None, max_length=100)
    note: Optional[str] = Field(None, max_length=500)


class PendingBillingOut(BaseModel):
    """Preview of what a hospital's NEXT invoice would look like right now,
    before actually generating one."""
    case_count: int
    total_amount: float
