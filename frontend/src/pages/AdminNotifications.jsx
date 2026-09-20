import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import api from "../api/client";

const TABS = [
  ["pending", "Pending"],
  ["sent", "Sent"],
  ["failed", "Failed"],
];

const PURPOSE_LABEL = {
  hospital_discharge: "Hospital — discharge notify",
};

export default function AdminNotifications() {
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/notifications", { params: { status: tab } });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tab]); // eslint-disable-line

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h1 className="font-display text-3xl text-ink">WhatsApp Queue</h1>
        <Link to="/admin" className="text-sm font-semibold text-violet">← Back to admin</Link>
      </div>
      <p className="text-ink/60 mb-8 max-w-2xl">
        No WhatsApp Business API is wired up yet — every message ROSKYRO needs to send lands here instead. Open it
        in WhatsApp (prefilled — just hit Send) and mark it sent, so the queue stays a true to-do list.
      </p>

      <div className="flex gap-6 border-b border-ink/10 mb-8">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px ${
              tab === key ? "border-violet text-violet" : "border-transparent text-ink/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-ink/50 mb-4">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-ink/60">
          {tab === "pending" ? "Nothing waiting to be sent — you're caught up." : `No ${tab} messages.`}
        </p>
      )}

      <div className="space-y-3">
        {items.map((n) => (
          <NotificationCard key={n.id} n={n} onChanged={load} />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({ n, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showFailForm, setShowFailForm] = useState(false);
  const [reason, setReason] = useState("");

  async function markSent() {
    setBusy(true);
    setError("");
    try {
      await api.post(`/admin/notifications/${n.id}/mark-sent`);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not mark this sent.");
    } finally {
      setBusy(false);
    }
  }

  async function markFailed(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(`/admin/notifications/${n.id}/mark-failed`, { reason });
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save this.");
    } finally {
      setBusy(false);
    }
  }

  async function requeue() {
    setBusy(true);
    setError("");
    try {
      await api.post(`/admin/notifications/${n.id}/requeue`);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not requeue this.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-ink/10 rounded-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-ink">{n.recipient_label || "—"}</div>
          <div className="text-sm text-ink/50">{n.recipient_phone} · {PURPOSE_LABEL[n.purpose] || n.purpose}</div>
          <div className="text-xs text-ink/40 mt-0.5">Queued {new Date(n.created_at).toLocaleString()}</div>
        </div>
        {n.status === "sent" && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sent by {n.sent_by_name || "admin"}
          </span>
        )}
        {n.status === "failed" && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        )}
      </div>

      <p className="text-sm text-ink/70 bg-slate-50 border border-ink/10 rounded-lg px-3 py-2.5 mt-3 whitespace-pre-wrap">
        {n.message}
      </p>

      {n.status === "failed" && n.failure_reason && (
        <p className="text-xs text-clay mt-2">Reason: {n.failure_reason}</p>
      )}
      {error && <p className="text-xs text-clay mt-2">{error}</p>}

      {n.status === "pending" && (
        <div className="flex flex-wrap gap-3 mt-3">
          <a
            href={n.wa_link}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-emerald-600 text-white flex items-center gap-1.5 hover:opacity-90"
          >
            <MessageCircle className="w-4 h-4" /> Open in WhatsApp
          </a>
          <button
            disabled={busy}
            onClick={markSent}
            className="text-sm font-semibold px-4 py-2 rounded-full bg-violet text-white disabled:opacity-60"
          >
            I sent this
          </button>
          <button
            disabled={busy}
            onClick={() => setShowFailForm((v) => !v)}
            className="text-sm font-semibold text-clay ml-auto"
          >
            {showFailForm ? "Cancel" : "Couldn't send it"}
          </button>
        </div>
      )}

      {n.status === "failed" && (
        <button
          disabled={busy}
          onClick={requeue}
          className="text-xs font-semibold text-violet mt-3 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Put back in the queue
        </button>
      )}

      {showFailForm && (
        <form onSubmit={markFailed} className="mt-3 border-t border-ink/10 pt-3 flex flex-wrap gap-2 items-center">
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why it didn't go through (e.g. number switched off)"
            className="flex-1 min-w-[220px] text-sm border border-ink/15 rounded-lg px-3 py-2"
          />
          <button disabled={busy} className="text-sm font-semibold px-4 py-2 rounded-full bg-clay text-white disabled:opacity-60">
            {busy ? "Saving…" : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}
