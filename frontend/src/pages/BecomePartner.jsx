import { useState } from "react";
import { 
  UserPlus, 
  ShieldCheck, 
  Wallet, 
  Award, 
  Calendar, 
  TrendingUp, 
  HeartHandshake, 
  MessageSquare,
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import api from "../api/client";
import { BRAND, SUPPORT_PHONE_DISPLAY, JOIN_WA_LINK } from "../config";
import useSEO from "../hooks/useSEO";

const BENEFITS = [
  {
    icon: Wallet,
    title: "Weekly Direct UPI Payouts",
    desc: "Fixed monthly base pay plus additional daily hospital coverage fees, sent straight to your UPI or bank account every week.",
  },
  {
    icon: ShieldCheck,
    title: "Accident & Medical Insurance",
    desc: "Comprehensive accidental coverage from day one of field deployment, plus health insurance benefits as you qualify.",
  },
  {
    icon: Award,
    title: "Professional Healthcare Certification",
    desc: "5-day paid training covering hospital ethics, patient navigation, safety guidelines, and professional etiquette.",
  },
  {
    icon: Calendar,
    title: "12 Paid Annual Leaves",
    desc: "We value your health and personal life — enjoy paid time off without losing your base earnings.",
  },
  {
    icon: TrendingUp,
    title: "Structured Promotion Track",
    desc: "Fast advancement: Trainee Relationship Officer → Senior Concierge Partner → Hospital Floor Lead.",
  },
  {
    icon: HeartHandshake,
    title: "Dignity, Uniform & Respect",
    desc: "Official ROSKYRO uniform, photo identity badge, and respect as an indispensable hospital care companion.",
  },
];

const REQUIREMENTS = [
  "Minimum 12th Pass or Graduate in any stream",
  "Empathetic demeanor, polite speech & active listening skills",
  "Clean background check (Aadhaar & Police Verification)",
  "Fluency in Hindi (local language dialect is a plus)",
  "Smartphone with WhatsApp capability for real-time task logging",
];

const STEPS = [
  { title: "1. Quick 1-Min Application", desc: "Submit your basic contact details online." },
  { title: "2. Personal Interview", desc: "Meet our care operations team in Ambikapur." },
  { title: "3. Document Verification", desc: "Aadhaar, address proof & reference checks." },
  { title: "4. 5-Day Certification", desc: "Hands-on hospital concierge training & kit handover." },
  { title: "5. Active Hospital Floor Placement", desc: "Start welcoming patients and earning weekly." },
];

export default function BecomePartner() {
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useSEO({
    path: "/become-a-partner",
    title: `Join ROSKYRO — Careers for Relationship Officers`,
    description:
      "Become a certified ROSKYRO Relationship Officer in Ambikapur. Earn fair weekly pay, comprehensive insurance, 12 paid leaves, and work with professional respect.",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/agents/apply", form);
      setStatus("submitted");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not submit your application. Please call our helpline.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-parchment min-h-screen">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-6">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Pillar 03 · Healthcare Careers With Dignity</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Join ROSKYRO. Earn with Dignity.
          </h1>

          <p className="text-white/80 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg mb-8">
            Become a certified Relationship Officer — earn steady base pay, enjoy weekly UPI incentives, full insurance coverage, and the pride of helping patients and families when they need it most.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#apply-form"
              className="px-7 py-3.5 rounded-full bg-brand-gradient hover:brightness-110 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all"
            >
              <span>Apply in 1 Minute</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={JOIN_WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-white font-semibold text-sm sm:text-base flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-flare" />
              <span>Recruiter Helpline (WhatsApp): {SUPPORT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Benefits & Application Form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Benefits & Growth */}
          <div className="lg:col-span-7">
            <span className="text-xs font-bold uppercase tracking-widest text-violet">Real Employee Benefits</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-4">
              Why Care Professionals Choose ROSKYRO
            </h2>
            <p className="text-ink-muted text-sm sm:text-base leading-relaxed mb-8">
              ROSKYRO is not an irregular gig app. We are building India's premier Healthcare Concierge cadre where every officer is respected, trained, and rewarded fairly.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-ink/10 rounded-2xl p-5 shadow-xs hover:border-violet-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-violet/10 text-violet flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-ink text-sm mb-1">{title}</div>
                  <div className="text-xs text-ink-muted leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>

            {/* Eligibility */}
            <div className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="font-display text-lg font-bold text-ink mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet" />
                <span>Who Can Apply?</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-ink/80">
                {REQUIREMENTS.map((req) => (
                  <li key={req} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div id="apply-form" className="lg:col-span-5">
            <div className="bg-white border-2 border-violet-200 rounded-3xl p-6 sm:p-8 shadow-xl relative">
              <div className="text-xs font-bold uppercase tracking-wider text-violet mb-1">
                Direct Officer Hiring
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-2">Apply Online Now</h3>
              <p className="text-xs text-ink-muted mb-6">
                Fill in your details below. Our Ambikapur team will call you within 24 hours to schedule an in-person meeting.
              </p>

              {status === "submitted" ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h4 className="font-display text-xl font-bold text-emerald-900 mb-2">Application Received!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you for applying to ROSKYRO! Our recruitment team in Ambikapur has received your submission and will call you at <strong>{form.phone}</strong> for document verification and interview scheduling.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">Full Name (as on Aadhaar)</label>
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className="w-full text-xs sm:text-sm rounded-xl border border-ink/15 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">Phone Number (WhatsApp Active)</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full text-xs sm:text-sm rounded-xl border border-ink/15 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full text-xs sm:text-sm rounded-xl border border-ink/15 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-brand-gradient hover:brightness-110 text-white font-bold text-sm shadow-md shadow-violet-500/25 transition-all disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Officer Application"}
                  </button>

                  <div className="text-[11px] text-ink-muted text-center pt-2">
                    Zero application fees. Free official training &amp; uniform kit provided.
                  </div>
                </form>
              )}
            </div>

            {/* Hiring Steps */}
            <div className="mt-8 bg-slate-100/80 rounded-2xl p-5 border border-ink/10">
              <div className="font-bold text-xs uppercase tracking-wider text-ink/70 mb-3">Onboarding Roadmap</div>
              <div className="space-y-2.5">
                {STEPS.map((s) => (
                  <div key={s.title} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-ink">{s.title}:</span>{" "}
                      <span className="text-ink-muted">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
