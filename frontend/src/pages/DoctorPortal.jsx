import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, Stethoscope, Phone, ClipboardList, Send } from "lucide-react";
import api from "../api/client";

const PLAN_LABEL = {
  doctor_concierge: "Doctor + Healthcare Concierge",
};

const REFERRAL_CATEGORIES = [
  { value: "hospital", label: "Hospital coordination" },
  { value: "specialist", label: "Specialist referral" },
  { value: "diagnostic", label: "Diagnostic / lab" },
  { value: "admission", label: "Admission assistance" },
  { value: "discharge", label: "Discharge assistance" },
  { value: "physical_assistance", label: "Physical assistance" },
  { value: "medical_travel", label: "Medical travel" },
  { value: "other", label: "Other coordination" },
];

export default function DoctorPortal() {
  const { token } = useParams();
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get(`/doctor/portal/${token}`);
      setPortal(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "This link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]); // eslint-disable-line

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-ink/60 text-sm font-medium">Loading…</p>
      </div>
    );
  }

  if (error && !portal) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-clay mx-auto" />
        <p className="text-ink font-semibold">{error}</p>
        <p className="text-ink/50 text-xs">Ask ROSKYRO to send you a fresh link.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-violet bg-violet/10 px-2.5 py-1 rounded-full">
          <Stethoscope className="w-3 h-3" />
          Concierge Doctor Portal
        </div>
        <h1 className="font-display text-xl font-bold text-ink">Dr. {portal.full_name}</h1>
        <p className="text-xs text-ink/50">
          {portal.specialty || "General Medicine"} · {portal.assigned_member_count} member{portal.assigned_member_count === 1 ? "" : "s"} assigned to you
        </p>
      </div>

      {portal.members.length === 0 && (
        <p className="text-center text-sm text-ink/50">No members are assigned to you yet.</p>
      )}

      <div className="space-y-3">
        {portal.members.map((m) => (
          <MemberCard key={m.membership_id} m={m} token={token} onLogged={load} />
        ))}
      </div>
    </div>
  );
}

function MemberCard({ m, token, onLogged }) {
  const [open, setOpen] = useState(null); // null | "consultation" | "referral"

  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-4 space-y-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-ink">{m.customer_name}</div>
          <div className="text-xs text-ink/50">
            {m.member_code} · {PLAN_LABEL[m.plan] || m.plan}
          </div>
        </div>
        <a href={`tel:${m.customer_phone}`} className="text-violet shrink-0">
          <Phone className="w-4 h-4" />
        </a>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
        {m.consultations_unlimited ? (
          <span>{m.consultations_used} consultation{m.consultations_used === 1 ? "" : "s"} logged this year — Unlimited (fair-use)</span>
        ) : m.consultations_quota > 0 ? (
          <span>{m.consultations_remaining} of {m.consultations_quota} consultations remaining this year</span>
        ) : null}
        {m.open_care_request_count > 0 && (
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" />
            {m.open_care_request_count} open coordination request{m.open_care_request_count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOpen(open === "consultation" ? null : "consultation")}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet/10 text-violet"
        >
          Log a consultation
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === "referral" ? null : "referral")}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/5 text-ink"
        >
          Refer for coordination
        </button>
      </div>

      {open === "consultation" && (
        <LogConsultationForm token={token} membershipId={m.membership_id} onDone={() => { setOpen(null); onLogged(); }} />
      )}
      {open === "referral" && (
        <LogReferralForm token={token} membershipId={m.membership_id} onDone={() => { setOpen(null); onLogged(); }} />
      )}
    </div>
  );
}

function LogConsultationForm({ token, membershipId, onDone }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post(`/doctor/portal/${token}/consultations`, {
        membership_id: membershipId,
        note: note || null,
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not log this consultation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-slate-50 border border-ink/10 rounded-xl p-3 space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Short note (optional) — e.g. 'routine follow-up'"
        rows={2}
        className="w-full text-xs border border-ink/15 rounded-lg px-2.5 py-2"
      />
      <div className="flex items-center gap-2">
        <button disabled={saving} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet text-white disabled:opacity-60 flex items-center gap-1.5">
          <Send className="w-3 h-3" />
          {saving ? "Logging…" : "Confirm consultation"}
        </button>
        {error && <p className="text-[11px] text-clay">{error}</p>}
      </div>
    </form>
  );
}

function LogReferralForm({ token, membershipId, onDone }) {
  const [category, setCategory] = useState("other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) { setError("Give this referral a short title."); return; }
    setSaving(true);
    setError("");
    try {
      await api.post(`/doctor/portal/${token}/referrals`, {
        membership_id: membershipId,
        category,
        title: title.trim(),
        description: description || null,
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not log this referral.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-slate-50 border border-ink/10 rounded-xl p-3 space-y-2">
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs border border-ink/15 rounded-lg px-2.5 py-2">
        {REFERRAL_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What is this referral for? e.g. 'Cardiology consult'"
        className="w-full text-xs border border-ink/15 rounded-lg px-2.5 py-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Any detail the concierge should know (optional)"
        rows={2}
        className="w-full text-xs border border-ink/15 rounded-lg px-2.5 py-2"
      />
      <div className="flex items-center gap-2">
        <button disabled={saving} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet text-white disabled:opacity-60 flex items-center gap-1.5">
          <Send className="w-3 h-3" />
          {saving ? "Sending…" : "Send referral to concierge"}
        </button>
        {error && <p className="text-[11px] text-clay">{error}</p>}
      </div>
    </form>
  );
}
