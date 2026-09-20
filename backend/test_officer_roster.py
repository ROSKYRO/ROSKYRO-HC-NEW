import os, sys, tempfile
os.environ["DATABASE_URL"] = "sqlite:///" + tempfile.mktemp(suffix=".db")
os.environ["AUTO_SEED"] = "false"
sys.path.insert(0, ".")

from datetime import datetime, timedelta, date
from fastapi.testclient import TestClient
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
from app.models.patient_case import PatientCase
from app.core.security import hash_password

c = TestClient(app)
db = SessionLocal()
admin = User(full_name="Admin", phone="9800000001", hashed_password=hash_password("p"), role=UserRole.admin)
hosp = Hospital(name="Hosp A", per_patient_daily_rate=500.0)
hosp2 = Hospital(name="Hosp B", per_patient_daily_rate=600.0)
db.add_all([admin, hosp, hosp2]); db.commit()

unverified = Agent(full_name="RO Unverified", phone="9811111111", status=AgentStatus.applied)
suspended = Agent(full_name="RO Suspended", phone="9822222222", status=AgentStatus.suspended,
                   id_verified=True, police_verified=True, references_checked=True,
                   interview_passed=True, training_completed=True, id_card_issued=True)
verified = Agent(full_name="RO Verified", phone="9833333333", status=AgentStatus.active,
                  id_verified=True, police_verified=True, references_checked=True,
                  interview_passed=True, training_completed=True, id_card_issued=True,
                  hospital_daily_rate=400.0)
unavailable = Agent(full_name="RO Unavailable", phone="9844444444", status=AgentStatus.active,
                     id_verified=True, police_verified=True, references_checked=True,
                     interview_passed=True, training_completed=True, id_card_issued=True,
                     is_available=False)
db.add_all([unverified, suspended, verified, unavailable]); db.commit()
HA, HB = hosp.id, hosp2.id
AG_UNVER, AG_SUSP, AG_OK, AG_UNAVAIL = unverified.id, suspended.id, verified.id, unavailable.id
db.close()

from app.core import deps
app.dependency_overrides[deps.require_admin] = lambda: SessionLocal().query(User).filter(User.role==UserRole.admin).first()

# A valid-enough "photo" for the officer discharge endpoint, which now
# requires one as proof (see _decode_photo in routers/officer.py — needs to
# decode as base64 and be >=100 bytes).
# A valid-enough "photo" for the officer discharge endpoint, which now takes
# a Google Drive share link (officer takes the photo, shares it on WhatsApp,
# someone saves it to Drive) instead of an uploaded image — see
# _validate_photo_url in routers/officer.py: just needs to start with http(s)://.
FAKE_PHOTO_URL = "https://drive.google.com/file/d/fake-officer-roster-photo/view"

def new_case(name, hid=HA):
    d = SessionLocal()
    case = PatientCase(hospital_id=hid, patient_name=name, attendant_phone="9000000000",
                       admission_date=date.today(), daily_rate=500.0)
    d.add(case); d.commit(); cid = case.id; d.close()
    return cid

def show(label, r):
    ok = r.status_code < 300
    print(f"{'PASS' if ok else 'FAIL'} [{r.status_code}] {label}" + ("" if ok else f" -> {r.text[:200]}"))
    return r.json() if ok else None

print("\n=== Hard block: unverified officer can never be assigned ===")
cid = new_case("P1")
r = c.post(f"/api/admin/hospital-program/patients/{cid}/assign", json={"agent_id": AG_UNVER})
print(f"   {'PASS' if r.status_code==400 else 'FAIL'} [{r.status_code}] {r.json().get('detail','')[:100]}")

print("\n=== Hard block: suspended officer can never be assigned (even with force) ===")
r = c.post(f"/api/admin/hospital-program/patients/{cid}/assign", json={"agent_id": AG_SUSP, "force": True})
print(f"   {'PASS' if r.status_code==400 else 'FAIL'} [{r.status_code}] {r.json().get('detail','')[:100]} (force ignored, as expected)")

print("\n=== Soft block: unavailable officer rejected as 409, force overrides ===")
r = c.post(f"/api/admin/hospital-program/patients/{cid}/assign", json={"agent_id": AG_UNAVAIL})
print(f"   {'PASS' if r.status_code==409 else 'FAIL'} [{r.status_code}] {r.json().get('detail','')[:100]}")
r = c.post(f"/api/admin/hospital-program/patients/{cid}/assign", json={"agent_id": AG_UNAVAIL, "force": True})
print(f"   {'PASS' if r.status_code==200 else 'FAIL'} force=true works [{r.status_code}]")

print("\n=== Double-booking cap: 5th same-day patient on one officer rejected ===")
ids = [new_case(f"Cap{i}", hid=HA if i%2==0 else HB) for i in range(5)]
last_r = None
for i, pid in enumerate(ids):
    r = c.post(f"/api/admin/hospital-program/patients/{pid}/assign", json={"agent_id": AG_OK})
    print(f"   patient {i+1}/5 -> [{r.status_code}]" + ("" if r.status_code < 300 else f" {r.json().get('detail','')[:120]}"))
    last_r = r
assert last_r.status_code == 409, "5th patient should have been capacity-blocked"
r = c.post(f"/api/admin/hospital-program/patients/{ids[4]}/assign", json={"agent_id": AG_OK, "force": True})
print(f"   force=true lets 5th through -> [{r.status_code}]")

print("\n=== Officer roster: RO Verified's real workload ===")
j = show("GET /officers/{id}", c.get(f"/api/admin/hospital-program/officers/{AG_OK}"))
print(f"   today_patient_count={j['today_patient_count']} active_case_count={j['active_case_count']} over_capacity_today={j['over_capacity_today']}")
print(f"   today_cases: {[(x['patient_name'], x['hospital_name']) for x in j['today_cases']]}")
assert j["today_patient_count"] == 5
assert j["over_capacity_today"] is True

j = show("GET /officers (roster list)", c.get("/api/admin/hospital-program/officers"))
names = [o["full_name"] for o in j]
print(f"   officers on the program: {names}")
assert "RO Unverified" not in names, "an officer with zero cases shouldn't show up by default"

print("\n=== is_available is now a real, editable, enforced flag ===")
r = c.patch(f"/api/admin/partners/{AG_UNAVAIL}", json={"is_available": True})
print(f"   admin flips is_available back to true -> [{r.status_code}] is_available={r.json()['is_available']}")
r = c.post(f"/api/admin/hospital-program/patients/{new_case('P_avail_check')}/assign", json={"agent_id": AG_UNAVAIL})
print(f"   now assignable without force -> [{r.status_code}]")
assert r.status_code == 200

print("\n=== hospital_daily_rate editable, drives payout estimate ===")
r = c.patch(f"/api/admin/partners/{AG_OK}", json={"hospital_daily_rate": 450.0})
print(f"   set rate -> [{r.status_code}]")
j = c.get(f"/api/admin/hospital-program/officers/{AG_OK}").json()
print(f"   days_covered_this_month={j['days_covered_this_month']} payout_estimate_this_month={j['payout_estimate_this_month']}")
assert j["payout_estimate_this_month"] == j["days_covered_this_month"] * 450.0

print("\n=== total_jobs increments exactly once when a hospital case closes ===")
before = c.get(f"/api/admin/hospital-program/officers/{AG_OK}").json()
cid2 = new_case("JobCount1")
c.post(f"/api/admin/hospital-program/patients/{cid2}/assign", json={"agent_id": AG_OK, "force": True})
tok = c.get(f"/api/admin/hospital-program/patients/{cid2}").json()["officer_discharge_token"]
j = c.post(f"/api/officer/discharge/{tok}", json={"photo_url": FAKE_PHOTO_URL}).json()
print(f"   case status after officer confirms (with photo): {j['status']}")
assert j["status"] == "discharged", "officer confirmation alone should close the case now"
d = SessionLocal(); jobs_after = d.query(Agent).get(AG_OK).total_jobs; d.close()
print(f"   total_jobs after 1 closed case: {jobs_after}")
# a case the officer never confirms — force-close it instead, and check
# total_jobs increments for that path too, exactly once
cid3 = new_case("JobCount2")
c.post(f"/api/admin/hospital-program/patients/{cid3}/assign", json={"agent_id": AG_OK, "force": True})
r = c.post(f"/api/admin/hospital-program/patients/{cid3}/force-close-discharge", json={"reason": "officer unreachable"})
print(f"   force-close (officer never confirmed) -> [{r.status_code}] status={r.json().get('status')}")
d = SessionLocal(); jobs_after2 = d.query(Agent).get(AG_OK).total_jobs; d.close()
print(f"   total_jobs after force-closed case too: {jobs_after2}")
assert jobs_after2 == jobs_after + 1

print("\n=== Officer's own portal: sees today's patients across hospitals ===")
r = show("admin issues portal link", c.post(f"/api/admin/hospital-program/officers/{AG_OK}/portal-link"))
ptok = r["portal_token"]
j = show("officer opens their own portal", c.get(f"/api/officer/portal/{ptok}"))
print(f"   {j['full_name']}: today_patient_count={j['today_patient_count']}, cases={[ (x['patient_name'], x['hospital_name'], x['covering_today']) for x in j['cases']]}")
r2 = c.post(f"/api/admin/hospital-program/officers/{AG_OK}/portal-link")  # rotate
r3 = c.get(f"/api/officer/portal/{ptok}")
print(f"   old portal link now dead after rotate -> [{r3.status_code}]")
assert r3.status_code == 404

print("\nALL OFFICER-ROSTER CHECKS DONE")
