import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, HeartHandshake, MessageCircle, MessageSquare, Sparkles, Wallet,
  ClipboardCheck, ArrowRight, Building, CheckCircle2, ShieldCheck, Mail, Send
} from "lucide-react";
import { BRAND, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, HOSPITAL_WA_LINK } from "../config";
import useSEO from "../hooks/useSEO";

const BENEFITS = [
  {
    icon: Users,
    title: "Better Patient Navigation",
    body: "Patients and attendants know exactly whom to approach — one dedicated point of contact, not a confusing maze of counters.",
  },
  {
    icon: UserCheck,
    title: "Dedicated Human Support",
    body: "Every enrolled patient has a named ROSKYRO Relationship Officer, assigned within 30 minutes of admission.",
  },
  {
    icon: HeartHandshake,
    title: "Reduced Non-Clinical Load",
    body: "Your nursing and clinical staff stay focused on medicine — ROSKYRO handles coordination, paperwork, and family questions.",
  },
  {
    icon: MessageCircle,
    title: "Structured Family Updates",
    body: "Attendants receive timely, authorized updates, dramatically reducing repeated crowding at the nursing desk.",
  },
  {
    icon: Sparkles,
    title: "Consistent Patient Experience",
    body: "A standardized, dignified concierge experience across the stay — from admission and scan escort to discharge clearance.",
  },
  {
    icon: Wallet,
    title: "Zero Payroll Burden",
    body: "ROSKYRO recruits, background-checks, trains, schedules, and pays its own Relationship Officer workforce.",
  },
];

const METRICS = [
  { value: "0", label: "Payroll Cost", desc: "No hospital HR or salary overhead" },
  { value: "< 30m", label: "Officer Greeting", desc: "Bedside meeting after admission" },
  { value: "40%", label: "Faster Discharge", desc: "Clearance and bills prepped early" },
  { value: "100%", label: "Police Checked", desc: "Strict verification on record" },
];

const JOURNEY = [
  "Admission & Desk Registration",
  "Concierge Bedside Introduction",
  "Diagnostic & Lab Investigations",
  "Doctor & Procedure Escort",
  "Billing & Insurance Formalities",
  "Family Authorization & Updates",
  "Discharge Clearance & Summary",
  "Follow-up Guidance",
];

const ONBOARDING_STEPS = [
  {
    title: "1. Hospital admission",
    body: "A patient is admitted through your existing admission desk — nothing changes on your internal workflow.",
  },
  {
    title: "2. Enrolled case flag",
    body: "Your desk staff marks the admitted patient in the ROSKYRO Hospital Console or via quick notification.",
  },
  {
    title: "3. Dedicated Officer assigned",
    body: "ROSKYRO assigns one dedicated Relationship Officer who remains dedicated to the patient for their stay.",
  },
  {
    title: "4. Bedside greeting within 30 mins",
    body: "The Relationship Officer meets the patient or attendant, introduces themselves, and begins assistance.",
  },
  {
    title: "5. Active non-clinical coordination",
    body: "The officer coordinates paperwork, scan room escort, medicines, and family updates.",
  },
  {
    title: "6. Proactive discharge clearance",
    body: "Discharge summaries, pharmacy clearance, and billing are organized ahead of time for smooth turnaround.",
  },
];

export default function ForHospitals() {
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    hospitalName: "",
    contactPerson: "",
    phone: "",
    email: "",
    bedCount: "50-100",
    notes: ""
  });

  useSEO({
    path: "/for-hospitals",
    title: `${BRAND} Patient Concierge Program — For Hospitals & Healthcare Groups`,
    description:
      "A dedicated Relationship Officer for every enrolled patient — non-clinical coordination, family communication and discharge support, with no additional payroll for your hospital.",
  });

  const handleSubmitInquiry = (e) => {
    e.preventDefault();
    const mailtoSubject = encodeURIComponent(`Hospital Partnership Inquiry: ${inquiryForm.hospitalName}`);
    const mailtoBody = encodeURIComponent(
      `Hospital: ${inquiryForm.hospitalName}\nContact Person: ${inquiryForm.contactPerson}\nPhone: ${inquiryForm.phone}\nEmail: ${inquiryForm.email}\nBed Count: ${inquiryForm.bedCount}\nNotes: ${inquiryForm.notes}`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;
    setInquirySent(true);
  };

  return (
    <div className="bg-parchment min-h-screen">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Building className="w-3.5 h-3.5" />
            <span>Pillar 01 · For Hospitals &amp; Healthcare Groups</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            The Patient Concierge Program
          </h1>

          <p className="text-white/80 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg mb-10">
            A dedicated, background-verified ROSKYRO Relationship Officer for every enrolled patient — handling non-clinical coordination and family communication so your doctors and nurses can focus 100% on medicine.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#partnership-inquiry"
              className="px-7 py-3.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <span>Request Hospital Partnership</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              to="/hospital/login"
              className="px-6 py-3.5 rounded-full border border-white/25 hover:border-white/40 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base flex items-center gap-2 transition-all"
            >
              <Building className="w-4 h-4 text-indigo-300" />
              <span>Hospital Staff Console Login</span>
            </Link>

            <a
              href={HOSPITAL_WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3.5 rounded-full border border-white/20 text-white/90 hover:text-white text-sm sm:text-base flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-flare" />
              <span>WhatsApp Direct: {SUPPORT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="border-t border-white/10 bg-white/5 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {METRICS.map((m) => (
              <div key={m.label} className="p-2">
                <div className="font-display text-3xl sm:text-4xl font-bold text-indigo-300 mb-1">{m.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-white mb-0.5">{m.label}</div>
                <div className="text-[11px] text-white/50">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Hospitals Partner */}
      <div id="benefits" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-600">The Institutional Advantage</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-4">
            One Dedicated Person, For Every Patient
          </h2>
          <p className="text-ink-muted text-sm sm:text-base">
            Improve your hospital's patient satisfaction scores, streamline bed turnarounds, and reduce nurse burnout.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <div className="font-display text-lg font-bold text-ink mb-2">{title}</div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How a case is enrolled */}
      <div className="bg-slate-100/70 border-y border-ink/10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-600">Standardized Workflow</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
              Admission to Active Concierge in 6 Smooth Steps
            </h2>
            <p className="text-ink-muted text-sm">No complex software or workflow friction for your doctors or nurses.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.title} className="bg-white border border-ink/10 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="font-bold text-ink text-sm sm:text-base mb-1.5 text-indigo-900">{step.title}</div>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-200 text-xs text-indigo-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Relationship Officers introduce themselves within 30 minutes of patient admission.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Journey coverage */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-600">Full Stay Lifecycle</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
            Concierge Support Across Every Hospital Milestone
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {JOURNEY.map((stage) => (
            <div key={stage} className="flex items-center gap-2 bg-white border border-ink/10 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-ink shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Partnership Inquiry Form Section */}
      <div id="partnership-inquiry" className="bg-white border-t border-ink/10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="max-w-xl mx-auto text-center mb-8">
              <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
              <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                Partner Your Hospital with ROSKYRO
              </h3>
              <p className="text-white/70 text-xs sm:text-sm">
                Fill out the quick details below and our Healthcare Operations Director will get in touch with an officer coverage proposal.
              </p>
            </div>

            {inquirySent ? (
              <div className="p-6 bg-white/10 rounded-2xl text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-lg mb-1">Inquiry Prepared</h4>
                <p className="text-xs text-white/80">
                  Your email client should have opened with the details. We will respond promptly. Or message us directly on WhatsApp at{" "}
                  <a href={HOSPITAL_WA_LINK} target="_blank" rel="noreferrer" className="underline font-semibold"><strong>{SUPPORT_PHONE_DISPLAY}</strong></a>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4 max-w-xl mx-auto">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">Hospital / Group Name</label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.hospitalName}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, hospitalName: e.target.value })}
                      placeholder="e.g. LifeCare SuperSpeciality"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">Contact Person &amp; Role</label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.contactPerson}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, contactPerson: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Sharma, Medical Director"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">Mobile / WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      placeholder="e.g. contact@hospital.com"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Inpatient Bed Count</label>
                  <select
                    value={inquiryForm.bedCount}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, bedCount: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="Under 50 beds" className="bg-ink text-white">Under 50 beds</option>
                    <option value="50-100 beds" className="bg-ink text-white">50 - 100 beds</option>
                    <option value="100-250 beds" className="bg-ink text-white">100 - 250 beds</option>
                    <option value="250+ beds (Multi-speciality / Medical College)" className="bg-ink text-white">250+ beds (Multi-speciality / Hospital Group)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Message / Key Requirements (Optional)</label>
                  <textarea
                    rows={3}
                    value={inquiryForm.notes}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    placeholder="Tell us about your patient volume, departments, or current challenges with non-clinical coordination..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Partnership Proposal Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
