import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function MembershipSignup() {
  const [form, setForm] = useState({ full_name: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/membership/inquire", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not send your inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-3">Thanks, {form.full_name.split(" ")[0]}!</h1>
        <p className="text-ink/60 leading-relaxed">
          We've received your inquiry. A concierge will call you on <strong>{form.phone}</strong> to understand
          your needs — the doctor's specialization, your care requirement — and share your membership pricing
          based on that. There's no fixed fee, since every member's need is different.
        </p>
        <Link to="/" className="inline-block mt-8 text-sm font-semibold text-violet hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-20">
      <span className="text-xs font-semibold tracking-wide text-magenta">Become a member</span>
      <h1 className="font-display text-3xl text-ink mt-2 mb-2">Enquire about ROSKYRO Concierge</h1>
      <p className="text-ink/60 mb-4">
        There's no fixed membership fee — it depends on the doctor's specialization and the care your family
        needs. Tell us a bit about what you're looking for, and a concierge will call you back with pricing and
        next steps.
      </p>
      <Link
        to="/membership/info"
        target="_blank"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:text-magenta transition-colors mb-8"
      >
        📄 Read full membership information first — what's included, free Relationship Officer visits &amp; privacy
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink/70">Full name</label>
          <input required value={form.full_name} onChange={(e) => update("full_name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Phone number</label>
          <input type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet"
            placeholder="98XXXXXXXX" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">What do you need? (optional)</label>
          <textarea rows={3} value={form.message} onChange={(e) => update("message", e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet"
            placeholder="e.g. a cardiologist for my father, 70, diabetic" />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button disabled={loading}
          className="w-full py-3 rounded-full bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? "Sending…" : "Send inquiry"}
        </button>
      </form>

      <p className="text-xs text-ink/40 mt-6">
        No payment or account needed to inquire. We'll only ask for payment once you've agreed to a price with
        your concierge.
      </p>
      <p className="text-sm text-ink/60 mt-4">
        Prefer to talk first? <Link to="/membership/info" className="text-violet font-medium">See plan details</Link>{" "}
        or message us on WhatsApp.
      </p>
    </div>
  );
}
