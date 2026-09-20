import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link2, CheckCircle2, Clock, ShieldCheck, AlertTriangle, Building2 } from "lucide-react";
import api from "../api/client";

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }), // denied or unavailable — proceed without it
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

const STATUS_COPY = {
  active: {
    title: "Confirm Discharge",
    body: "Take a photo once the patient has actually been discharged, share it on WhatsApp to ROSKYRO ops, and paste the Google Drive link you get back below. This is the only confirmation needed — the hospital doesn't confirm separately, but they are notified right away and can flag it if something's wrong, so make sure the photo, link and time are accurate.",
  },
  // Legacy status: cases opened under the old two-sided confirmation could be
  // left here. Without an entry the officer saw an empty panel AND the confirm
  // form was hidden, so the case could never be closed from this link.
  pending_discharge: {
    title: "Confirm Discharge",
    body: "This case is waiting on your confirmation. Take a photo once the patient has actually been discharged, share it on WhatsApp to ROSKYRO ops, and paste the Google Drive link you get back below.",
  },
  discharged: {
    title: "Discharge Confirmed",
    body: "Your confirmation closed this case and billing has stopped. The hospital has been notified.",
  },
  cancelled: {
    title: "Case Cancelled",
    body: "This patient case was cancelled — there's nothing to discharge.",
  },
};

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OfficerDischarge() {
  const { token } = useParams();
  const [patientCase, setPatientCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [datetime, setDatetime] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const { data } = await api.get(`/officer/discharge/${token}`);
      setPatientCase(data);
      if (!datetime) {
        setDatetime(toLocalInputValue(data.officer_discharge_at) || toLocalInputValue(new Date().toISOString()));
      }
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "This link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientCase || !photoUrl.trim()) return;

    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const { lat, lng } = await getLocation();
      const { data } = await api.post(`/officer/discharge/${token}`, {
        discharge_datetime: datetime ? new Date(datetime).toISOString() : null,
        photo_url: photoUrl.trim(),
        lat, lng,
      });
      setMessage(data.message);
      setPhotoUrl("");
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not confirm discharge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function undo() {
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.delete(`/officer/discharge/${token}`);
      setMessage(data.message);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not withdraw your confirmation.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-ink/60 text-sm font-medium">Loading…</p>
      </div>
    );
  }

  if (error && !patientCase) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-clay mx-auto" />
        <p className="text-ink font-semibold">{error}</p>
        <p className="text-ink/50 text-xs">Please check the link or contact ROSKYRO dispatch.</p>
      </div>
    );
  }

  const stage = STATUS_COPY[patientCase.status] || {};
  const canConfirm = patientCase.status === "active" || patientCase.status === "pending_discharge";

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-5">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-violet bg-violet/10 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          Relationship Officer — Discharge Confirmation
        </div>
        <h1 className="font-display text-xl font-bold text-ink">{patientCase.patient_name}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 p-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-ink/60 text-xs">
          <Building2 className="w-3.5 h-3.5" />
          <span>{patientCase.hospital_name || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-ink/60 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>Admitted {patientCase.admission_date}</span>
        </div>
        <div className="text-xs text-ink/50">
          Your confirmation: {patientCase.officer_discharge_at
            ? new Date(patientCase.officer_discharge_at).toLocaleString()
            : "not yet confirmed"}
        </div>
      </div>

      <div className="bg-slate-50 border border-ink/10 rounded-2xl p-5 text-center space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">{stage.title}</h2>
        <p className="text-xs text-ink/60 leading-relaxed">{stage.body}</p>

        {canConfirm && (
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <label className="block">
              <span className="text-xs font-semibold text-ink/60">Discharge date & time</span>
              <input
                type="datetime-local"
                required
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full mt-1 text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white"
              />
            </label>
            <div className="p-2.5 bg-violet/5 border border-violet/15 rounded-lg text-[11px] text-ink/60 leading-relaxed">
              1. Take the discharge photo.<br />
              2. Share it on WhatsApp to ROSKYRO ops.<br />
              3. Paste the Google Drive link you get back below.
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-ink/60">Google Drive photo link</span>
              <input
                type="url"
                required
                placeholder="https://drive.google.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full mt-1 text-sm border border-ink/15 rounded-lg px-3 py-2 bg-white"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || !photoUrl.trim()}
              className="w-full px-5 py-3.5 rounded-full bg-brand-gradient text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-violet/20 hover:opacity-95 disabled:opacity-60"
            >
              <Link2 className="w-4.5 h-4.5" />
              <span>{submitting ? "Submitting…" : "Confirm Discharge"}</span>
            </button>
            {patientCase.officer_discharge_at && (
              <button
                type="button"
                onClick={undo}
                disabled={submitting}
                className="w-full text-xs font-semibold text-ink/50 disabled:opacity-50"
              >
                Withdraw my confirmation
              </button>
            )}
            <p className="text-[10px] text-ink/40 text-center leading-relaxed">
              A photo link is required as proof — timestamp and location (if allowed) are captured automatically.
              The discharge time can't be before admission or in the future.
              {patientCase.link_expires_at && ` This link stops working on ${new Date(patientCase.link_expires_at).toLocaleDateString()}.`}
            </p>
          </form>
        )}

        {patientCase.status === "discharged" && (
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
        )}
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium text-center">
          {message}
        </div>
      )}
      {error && patientCase && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium text-center">
          {error}
        </div>
      )}
    </div>
  );
}
