"""
Regression script for timestamp handling (see app/core/timeutil.py).

The bug this locks down: the API used to return UTC datetimes as
"2026-09-19T09:20:00" (no timezone), which browsers read as the viewer's LOCAL
time -> every timestamp in India showed 5h30m early (admin panel, hospital
dashboard, the customer's live visit timer). Now every UTC datetime goes out
with a trailing "Z".

Not pytest-style — run directly:  python test_timezone.py
"""
import os, sys, tempfile, base64, typing, inspect, pkgutil, importlib
os.environ["DATABASE_URL"] = "sqlite:///" + tempfile.mktemp(suffix=".db")
os.environ["AUTO_SEED"] = "false"
sys.path.insert(0, ".")

from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from pydantic import BaseModel, PlainSerializer
from app.main import app
# Give this script its own isolated SQLite file, regardless of what any
# other test_*.py already imported earlier in this process — see
# app/db/testing.py for why os.environ["DATABASE_URL"] above isn't
# enough by itself once more than one of these scripts runs together.
from app.db.testing import reset_test_database
reset_test_database()
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.hospital import Hospital
from app.models.agent import Agent, AgentStatus
from app.core.security import hash_password
from app.core import deps
from app.core.timeutil import as_naive_utc, to_iso_z, format_ist
import app.schemas as schemas_pkg


def check(label, ok, extra=""):
    print(f"{'PASS' if ok else 'FAIL'} {label}" + (f"  {extra}" if extra else ""))
    assert ok, label


Z_RE = __import__("re").compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$")


print("\n=== helpers ===")
check("naive UTC -> '...Z' with millisecond precision", to_iso_z(datetime(2026, 9, 19, 9, 20, 5, 123456)) == "2026-09-19T09:20:05.123Z")
check("aware (+05:30) is converted to UTC first", to_iso_z(datetime(2026, 9, 19, 14, 50, tzinfo=timezone(timedelta(hours=5, minutes=30)))) == "2026-09-19T09:20:00.000Z")
check("as_naive_utc leaves a naive value alone", as_naive_utc(datetime(2026, 1, 1, 12, 0)) == datetime(2026, 1, 1, 12, 0))
check("format_ist: 09:20 UTC is 14:50 IST", format_ist(datetime(2026, 9, 19, 9, 20)) == "19 Sep 2026, 14:50 IST", format_ist(datetime(2026, 9, 19, 9, 20)))
check("format_ist crosses midnight correctly (20:00 UTC -> 01:30 next day)", format_ist(datetime(2026, 9, 19, 20, 0)) == "20 Sep 2026, 01:30 IST")


print("\n=== guard: no response field may be a bare `datetime` ===")
# Walks every Pydantic model in app.schemas. A new `foo_at: datetime` (instead of
# UTCDateTime) would silently reintroduce the 5h30m bug, so it fails here.
ALLOWED_BARE = {("TransportRequestIn", "requested_time"), ("TransportRequestOut", "requested_time")}  # wall-clock input, on purpose

def _is_utc_annotated(ann):
    if typing.get_origin(ann) is typing.Annotated:
        return any(isinstance(m, PlainSerializer) for m in ann.__metadata__)
    return False

def _bare_datetime(field):
    """True if this field holds a datetime that is NOT wrapped in UTCDateTime."""
    if any(isinstance(m, PlainSerializer) for m in field.metadata):
        return False
    def walk(a):
        if _is_utc_annotated(a):
            return False
        if a is datetime:
            return True
        return any(walk(x) for x in typing.get_args(a))
    return walk(field.annotation)

bad, scanned = [], 0
for mod in pkgutil.iter_modules(schemas_pkg.__path__):
    m = importlib.import_module(f"app.schemas.{mod.name}")
    for name, cls in inspect.getmembers(m, inspect.isclass):
        if issubclass(cls, BaseModel) and cls.__module__ == m.__name__:
            for fname, f in cls.model_fields.items():
                if "datetime" in repr(f.annotation).lower() or any(isinstance(x, PlainSerializer) for x in f.metadata):
                    scanned += 1
                if _bare_datetime(f) and (name, fname) not in ALLOWED_BARE:
                    bad.append(f"{m.__name__.split('.')[-1]}.{name}.{fname}")
check(f"scanned {scanned} datetime fields across app.schemas, none bare", not bad, f"BARE: {bad}" if bad else "")


print("\n=== the deliberate exception: requested_time stays wall-clock ===")
from app.schemas.membership import TransportRequestOut
o = TransportRequestOut(id=1, status="requested", pickup_address="a", drop_address="b",
                        requested_time=datetime(2026, 9, 19, 14, 30), created_at=datetime(2026, 9, 19, 9, 0))
j = o.model_dump(mode="json")
check("requested_time round-trips exactly as typed (no Z, no shift)", j["requested_time"] == "2026-09-19T14:30:00", j["requested_time"])
check("created_at (real UTC) gets the Z", j["created_at"] == "2026-09-19T09:00:00.000Z", j["created_at"])
check("python-side model_dump() still returns real datetimes", isinstance(o.model_dump()["created_at"], datetime))


print("\n=== API end-to-end ===")
c = TestClient(app); db = SessionLocal()
admin = User(full_name="Admin", phone="9000000001", hashed_password=hash_password("p"), role=UserRole.admin)
hosp = Hospital(name="H", per_patient_daily_rate=500.0, contact_phone="9199999999")
db.add_all([admin, hosp]); db.commit()
staff = User(full_name="Nurse", phone="9000000002", hashed_password=hash_password("p"), role=UserRole.hospital_staff, hospital_id=hosp.id)
v = dict(status=AgentStatus.active, id_verified=True, police_verified=True, references_checked=True,
         interview_passed=True, training_completed=True, id_card_issued=True)
ag = Agent(full_name="RO", phone="9111111111", **v)
db.add_all([staff, ag]); db.commit()
HID, AID = hosp.id, ag.id; db.close()
app.dependency_overrides[deps.require_admin] = lambda: SessionLocal().query(User).filter(User.role == UserRole.admin).first()
app.dependency_overrides[deps.require_hospital_staff] = lambda: SessionLocal().query(User).filter(User.role == UserRole.hospital_staff).first()
PHOTO_URL = "https://drive.google.com/file/d/fake-timezone-test-photo/view"

r = c.post(f"/api/admin/hospital-program/hospitals/{HID}/patients", json={"patient_name": "TZ Patient", "attendant_phone": "9333333333"})
assert r.status_code == 200, r.text
cid = r.json()["id"]
check("admin case: created_at ends in Z", Z_RE.match(r.json()["created_at"]) is not None, r.json()["created_at"])
c.post(f"/api/admin/hospital-program/patients/{cid}/assign", json={"agent_id": AID, "force": True})
tok = c.get(f"/api/admin/hospital-program/patients/{cid}").json()["officer_discharge_token"]

# Officer's phone posts the discharge time in IST (+05:30) — e.g. what an offset-carrying client would send.
now_utc = datetime.utcnow().replace(microsecond=0)
when_utc = now_utc - timedelta(hours=2)
when_ist_str = (when_utc + timedelta(hours=5, minutes=30)).isoformat() + "+05:30"
r = c.post(f"/api/officer/discharge/{tok}", json={"discharge_datetime": when_ist_str, "photo_url": PHOTO_URL, "lat": 23.1, "lng": 83.2})
assert r.status_code == 200, r.text
expected = when_utc.isoformat() + ".000Z"

j = c.get(f"/api/admin/hospital-program/patients/{cid}").json()
check("+05:30 input is stored as the right UTC instant and returned with Z", j["officer_discharge_at"] == expected, f"{j['officer_discharge_at']} (expected {expected})")
for f in ("discharged_at", "hospital_notified_at", "hospital_dispute_deadline", "discharge_photo_at", "created_at"):
    check(f"admin view: {f} is UTC-with-Z", Z_RE.match(j[f] or "") is not None, str(j[f]))

hj = c.get(f"/api/hospital-console/patients/{cid}").json()
check("hospital view: discharged_at is UTC-with-Z and the same instant", hj["discharged_at"] == expected, hj["discharged_at"])

oj = c.get(f"/api/officer/discharge/{tok}").json()
check("officer's own page: officer_discharge_at / link_expires_at are UTC-with-Z",
      Z_RE.match(oj["officer_discharge_at"]) is not None and Z_RE.match(oj["link_expires_at"]) is not None)

pj = c.get(f"/api/admin/hospital-program/patients/{cid}/discharge-photo").json()
check("discharge-photo endpoint (raw dict, no schema): taken_at / discharged_at are UTC-with-Z",
      Z_RE.match(pj["taken_at"]) is not None and pj["discharged_at"] == expected, f"{pj['taken_at']} | {pj['discharged_at']}")

# The parsed value in a browser is what the admin actually sees: Z means "same instant everywhere".
parsed = datetime.fromisoformat(j["officer_discharge_at"].replace("Z", "+00:00"))
check("parsed as an absolute instant it equals what was entered", parsed == when_utc.replace(tzinfo=timezone.utc))

print("\n=== hospital notification text is in IST, not raw UTC ===")
d = SessionLocal()
from app.models.patient_case import PatientCase
case = d.query(PatientCase).get(cid); d.close()
import logging, io
buf = io.StringIO(); h = logging.StreamHandler(buf); logging.getLogger("roskyro.notifications").addHandler(h); logging.getLogger("roskyro.notifications").setLevel(logging.INFO)
cid2 = c.post(f"/api/admin/hospital-program/hospitals/{HID}/patients", json={"patient_name": "Msg Patient", "attendant_phone": "9333333333"}).json()["id"]
c.post(f"/api/admin/hospital-program/patients/{cid2}/assign", json={"agent_id": AID, "force": True})
tok2 = c.get(f"/api/admin/hospital-program/patients/{cid2}").json()["officer_discharge_token"]
c.post(f"/api/officer/discharge/{tok2}", json={"discharge_datetime": when_utc.isoformat() + "Z", "photo_url": PHOTO_URL})
logged = buf.getvalue()
ist_txt = format_ist(when_utc)
check("message carries the IST time", ist_txt in logged and " UTC" not in logged, logged.strip()[:170])

print("\nALL TIMEZONE CHECKS DONE")
