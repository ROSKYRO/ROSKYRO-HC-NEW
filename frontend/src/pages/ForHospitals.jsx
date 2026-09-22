import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, HeartHandshake, MessageCircle, MessageSquare, Sparkles, Wallet,
  ClipboardCheck, ArrowRight, Building, CheckCircle2, ShieldCheck, Mail, Send,
  AlertTriangle, Stethoscope, Crown, Ambulance, PhoneCall, Lock, FileCheck2, Quote,
  ClipboardList, Building2
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

const PROBLEMS = [
  "Patients and attendants get confused — which counter to go to, who to ask.",
  "Repeated family queries at the nursing desk cost clinical staff both time and focus.",
  "The discharge process slows down due to last-minute paperwork, pharmacy clearance and billing delays.",
  "Out-of-town or distant attendants don't get structured updates — leading to repeated calls and anxiety.",
  "The patient experience is inconsistent — every staff member handles things differently.",
  "Maintaining dedicated concierge / PRO staff means additional recruitment, training and payroll cost for the hospital.",
];

const COORDINATION_QUESTIONS = [
  "“When will the doctor arrive?”",
  "“Is the report ready?”",
  "“Where do I need to go for the test?”",
  "“What do I need to do for billing?”",
  "“When will the discharge happen?”",
  "“Who will update the family?”",
  "“How do I reach another department?”",
  "“Can someone arrange an ambulance?”",
];

const COORDINATION_BURDEN_ITEMS = [
  { icon: MessageCircle, text: "Patient & family communication" },
  { icon: Stethoscope, text: "Doctor & department coordination" },
  { icon: ClipboardList, text: "Reports & diagnostics follow-up" },
  { icon: ShieldCheck, text: "Admission & discharge coordination" },
  { icon: Wallet, text: "Billing-related assistance" },
  { icon: Building2, text: "Movement between departments" },
  { icon: Ambulance, text: "Ambulance & transport coordination" },
  { icon: PhoneCall, text: "Family updates and repeated enquiries" },
];

const YOUR_HOSPITAL_ROLE = [
  "Clinical treatment",
  "Doctors & medical teams",
  "Procedures & interventions",
  "Medical decisions",
  "In-hospital care",
];

const YOUR_ROSKYRO_TEAM = [
  "Patient & family assistance",
  "Doctor appointment coordination",
  "Specialist coordination",
  "Diagnostics coordination",
  "Admission & discharge assistance",
  "Hospital navigation",
  "Family & NRI updates",
  "Ambulance / medical travel coordination",
  "Reasonable physical assistance",
];

const RO_RESPONSIBILITIES = [
  "Counsels patients and attendants on treatment and related procedures.",
  "Explains treatment plans, investigations, procedures and packages clearly and professionally.",
  "Provides ongoing counselling support to antenatal and other long-treatment patients throughout their hospital journey.",
  "Coordinates with doctors, nursing staff and other departments for smooth patient care.",
  "Assists patients with admission, investigations, procedures and discharge-related coordination.",
  "Explains the hospital's services, packages, billing process and applicable policies to the patient.",
  "Maintains counselling records and follows up with patients as needed.",
  "Addresses patient queries and concerns promptly and professionally.",
  "Improves patient conversion and satisfaction through ethical counselling.",
  "Maintains confidentiality of patient information and follows the hospital's policies/protocols.",
  "Escalates medical, financial or service-related concerns to the concerned department.",
];

const RO_VS_DOCTOR = {
  ro: [
    "Admission formalities and paperwork",
    "Investigation & department coordination",
    "Billing and policy guidance",
    "Discharge coordination",
    "Authorized family updates",
  ],
  doctor: [
    "Every treatment-related decision",
    "Diagnosis and clinical judgement",
    "Procedure execution",
    "Medicine and dosage decisions",
    "Responsibility for medical outcomes",
  ],
};

const MEMBERSHIP_HOSPITAL_BENEFITS = [
  {
    icon: Crown,
    title: "Priority Officer Dispatch",
    body: "Instant/priority Relationship Officer assignment on the Doctor + Healthcare Concierge plan — in some cases within 20 minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Dedicated Family Care Manager",
    body: "Complete admission & discharge oversight with a senior family care manager, further reducing load on hospital staff.",
  },
  {
    icon: Stethoscope,
    title: "Second-Opinion Coordination",
    body: "Second-opinion consultation coordination — reducing patient/family confusion and unnecessary escalation.",
  },
  {
    icon: MessageCircle,
    title: "Multi-Channel Family Updates",
    body: "Group updates for large families or out-of-town attendants — reducing pressure at the nursing desk.",
  },
  {
    icon: Ambulance,
    title: "Ambulance & Travel Coordination",
    body: "Verified ambulance and medical-travel coordination — helping with hospital logistics in emergency or referral cases.",
  },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, text: "Every Relationship Officer is 100% police-verified and background-checked." },
  { icon: FileCheck2, text: "Trained by ROSKYRO in line with the hospital's protocols, confidentiality requirements and escalation process." },
  { icon: Lock, text: "Counselling records are maintained and patient information is handled with strict confidentiality." },
  { icon: AlertTriangle, text: "Any medical, financial or service-related concern is escalated directly to the concerned hospital department — nothing is handled 'silently'." },
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
      <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Building className="w-3.5 h-3.5" />
            <span>Pillar 01 · For Hospitals &amp; Healthcare Groups</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            The Patient Concierge Program
          </h1>

          <p className="text-white/80 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg mb-8">
            A dedicated, background-verified ROSKYRO Relationship Officer for every enrolled patient — handling non-clinical coordination and family communication so your doctors and nurses can focus 100% on medicine.
          </p>

          <div className="max-w-xl mx-auto mb-10 flex items-start gap-3 text-left bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
            <Quote className="w-5 h-5 text-violet-300 shrink-0 mt-0.5" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed italic">
              ROSKYRO = Healthcare Concierge + Patient Assistance + Hospital Partnership Platform. ROSKYRO does not provide treatment — it provides support, coordination and assistance to the patient and family around the treatment.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#partnership-inquiry"
              className="px-7 py-3.5 rounded-full bg-brand-gradient hover:brightness-110 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all"
            >
              <span>Request Hospital Partnership</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              to="/hospital/login"
              className="px-6 py-3.5 rounded-full border border-white/25 hover:border-white/40 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base flex items-center gap-2 transition-all"
            >
              <Building className="w-4 h-4 text-violet-300" />
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
                <div className="font-display text-3xl sm:text-4xl font-bold text-violet-300 mb-1">{m.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-white mb-0.5">{m.label}</div>
                <div className="text-[11px] text-white/50">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Problem hospitals face today */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-clay">The Problem</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
            What Hospitals &amp; Clinics Struggle With Today
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROBLEMS.map((p) => (
            <div key={p} className="flex items-start gap-3 bg-clay/5 border border-clay/20 rounded-2xl p-4 sm:p-5">
              <AlertTriangle className="w-4 h-4 text-clay shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The Problem Behind Every Patient */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-clay">The Problem</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
            The Problem Behind Every Patient
          </h2>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed">
            Treating a patient is not the only thing a hospital has to manage. Every patient comes with a layer of
            coordination beyond the actual treatment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {COORDINATION_QUESTIONS.map((q) => (
            <div key={q} className="flex items-center gap-2.5 bg-clay/5 border border-clay/20 rounded-xl p-3.5">
              <PhoneCall className="w-4 h-4 text-clay shrink-0" />
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{q}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-2">
          <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
            For one patient, these may seem like small requests.
          </p>
          <p className="text-ink text-sm sm:text-base font-semibold leading-relaxed">
            But when a hospital is managing hundreds of patients, these small coordination tasks become a significant
            operational burden for the hospital staff.
          </p>
        </div>
      </div>

      {/* The hidden burden of hospital care */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14">
        <div className="bg-ink text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold tracking-widest uppercase text-flare">The Hidden Burden</span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">
                The Hidden Burden of Hospital Care
              </h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                The hidden cost of a hospital is <span className="text-white font-semibold">Patient Coordination Complexity</span>.
              </p>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed mt-2">
                Alongside clinical care, hospital staff constantly have to coordinate:
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {COORDINATION_BURDEN_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <Icon className="w-4 h-4 text-flare shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto text-center space-y-3">
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Hospitals can use software and systems to improve many of these processes. But software alone cannot
                solve every coordination problem.
              </p>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Because in healthcare, patients often need more than information. They need: someone who understands
                their situation, coordinates with the right people, helps when physical assistance is needed, and
                keeps the family informed.
              </p>
              <p className="text-flare text-sm sm:text-base font-bold pt-2">
                This is where ROSKYRO comes in.
              </p>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed pt-2">
                Your hospital takes care of the treatment. ROSKYRO takes care of the coordination around it.
                ROSKYRO acts as a human coordination layer between the hospital, the patient and the family.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Hospital vs Your ROSKYRO Coordination Team */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-violet-600">Clear Division of Work</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
            Your Hospital Stays Focused on Care. We Handle the Coordination.
          </h2>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed">
            Your hospital can stay focused on clinical care and treatment. ROSKYRO helps manage the coordination
            around that care.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-white border border-ink/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-ink" />
              <h3 className="font-bold text-ink text-sm sm:text-base">Your Hospital</h3>
            </div>
            <ul className="space-y-2.5">
              {YOUR_HOSPITAL_ROLE.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-ink-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-ink/60 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-violet-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <HeartHandshake className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-ink text-sm sm:text-base">Your ROSKYRO Coordination Team</h3>
            </div>
            <ul className="space-y-2.5">
              {YOUR_ROSKYRO_TEAM.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-ink-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-10 text-center space-y-2">
          <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
            So your staff can focus on care, not coordination. Patients get a dedicated coordination point. Families
            don&rsquo;t have to repeatedly contact different departments for every small requirement. And hospital
            staff can spend less time handling non-clinical coordination requests.
          </p>
          <p className="text-ink text-sm sm:text-base font-bold pt-2">
            Let your hospital focus on treating patients. Let ROSKYRO help coordinate everything around their care.
          </p>
        </div>
      </div>

      {/* Why Hospitals Partner */}
      <div id="benefits" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-violet-600">The Institutional Advantage</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-4">
            One Dedicated Person, For Every Patient
          </h2>
          <p className="text-ink-muted text-sm sm:text-base">
            Improve your hospital's patient satisfaction scores, streamline bed turnarounds, and reduce nurse burnout.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-violet-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <div className="font-display text-lg font-bold text-ink mb-2">{title}</div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What the Relationship Officer actually does, day to day */}
      <div className="bg-violet-950 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-300">Roles &amp; Responsibilities</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-3">
              What Your Dedicated Relationship Officer Actually Does
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              For every enrolled patient / attendant, the RO delivers this non-clinical support.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {RO_RESPONSIBILITIES.map((r) => (
              <div key={r} className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto flex items-start gap-3 bg-violet-500/10 border border-violet-400/30 rounded-2xl p-4 sm:p-5">
            <ShieldCheck className="w-5 h-5 text-violet-300 shrink-0 mt-0.5" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              <strong className="text-white">Important:</strong> An RO is not a medical attendant and does not make any treatment-related decisions. Every clinical decision always stays with the doctor and clinical team — the RO simply handles all the non-clinical work "around" the medicine, so clinical staff can focus purely on medicine.
            </p>
          </div>
        </div>
      </div>


      {/* How a case is enrolled */}
      <div className="bg-slate-100/70 border-y border-ink/10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-600">Standardized Workflow</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
              Admission to Active Concierge in 6 Smooth Steps
            </h2>
            <p className="text-ink-muted text-sm">No complex software or workflow friction for your doctors or nurses.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.title} className="bg-white border border-ink/10 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="font-bold text-ink text-sm sm:text-base mb-1.5 text-violet-900">{step.title}</div>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-violet-200 text-xs text-violet-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Relationship Officers introduce themselves within 30 minutes of patient admission.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Journey coverage */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-violet-600">Full Stay Lifecycle</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
            Concierge Support Across Every Hospital Milestone
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {JOURNEY.map((stage) => (
            <div key={stage} className="flex items-center gap-2 bg-white border border-ink/10 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-ink shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
              <span>{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RO vs. Doctor scope */}
      <div className="bg-slate-100/70 border-y border-ink/10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-600">Clear Scope, No Overlap</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
              What the RO Does vs. What Stays With the Doctor
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white border border-violet-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-ink text-sm sm:text-base">Relationship Officer (Non-Clinical)</h3>
              </div>
              <ul className="space-y-2.5">
                {RO_VS_DOCTOR.ro.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-ink-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-ink/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-ink" />
                <h3 className="font-bold text-ink text-sm sm:text-base">Doctor / Clinical Team</h3>
              </div>
              <ul className="space-y-2.5">
                {RO_VS_DOCTOR.doctor.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-ink-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ink-muted shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Extra benefit to the hospital via Membership plans */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-violet-600">Membership Spillover Benefit</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
            Extra Benefit to Your Hospital From Concierge Memberships
          </h2>
          <p className="text-ink-muted text-sm sm:text-base">
            ROSKYRO's Doctor + Healthcare Concierge Membership gives enrolled patients an extra layer of support — which benefits the hospital directly too.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MEMBERSHIP_HOSPITAL_BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white border border-ink/10 rounded-2xl p-6 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-violet/10 text-violet flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-display text-base font-bold text-ink mb-1.5">{title}</div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Verification */}
      <div className="bg-ink text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-flare">Trust &amp; Verification</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">Every Officer, Fully Accountable</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <Icon className="w-4 h-4 text-flare shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto mt-8 flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
            <Quote className="w-5 h-5 text-flare shrink-0 mt-0.5" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed italic">
              A ROSKYRO Relationship Officer is not just a "helper" — it is a zero-payroll, background-verified, fully-managed patient-experience layer for the hospital/clinic that frees up clinical staff, speeds up discharge, structures family communication, and measurably improves patient satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Partnership Inquiry Form Section */}
      <div id="partnership-inquiry" className="bg-white border-t border-ink/10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-violet-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="max-w-xl mx-auto text-center mb-8">
              <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-flare" />
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-400"
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-400"
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-400"
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Inpatient Bed Count</label>
                  <select
                    value={inquiryForm.bedCount}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, bedCount: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-gradient hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all"
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
