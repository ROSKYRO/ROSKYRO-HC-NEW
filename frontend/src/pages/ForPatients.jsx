import { Quote, ArrowRight, ShieldCheck, HeartHandshake, MessageSquare, Zap, UserCheck, Stethoscope, MessageCircle, Ambulance, CheckCircle2, HeartPulse, HelpCircle, Plane, CalendarCheck, Building2, ClipboardList, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { BRAND, SUPPORT_PHONE_DISPLAY, BOOK_WA_LINK } from "../config";
import useSEO from "../hooks/useSEO";
import ConciergeMembershipSection from "../components/sections/ConciergeMembershipSection";

const METRICS = [
  { value: "9", label: "Journey Stages Covered", desc: "Admission through to discharge closure" },
  { value: "< 20m", label: "Priority RO Dispatch", desc: "On the Doctor + Concierge plan" },
  { value: "100%", label: "Police-Verified Officers", desc: "Background-checked & trained" },
  { value: "24/7", label: "Family Updates", desc: "Structured, authorized communication" },
];

const JOURNEY = [
  { stage: "Admission", body: "Your Relationship Officer meets you at admission — paperwork, formalities, and settling in." },
  { stage: "Investigations", body: "Coordination for tests and scans, so appointments and reports don't get lost in the process." },
  { stage: "Procedures", body: "Support around procedure timings and preparation — logistics, not clinical decisions." },
  { stage: "Doctor / Department Coordination", body: "Help reaching the right doctor or department when you need to." },
  { stage: "Billing / Administrative Guidance", body: "Someone who can explain the paperwork and walk you through billing steps." },
  { stage: "Discharge Coordination", body: "Discharge formalities coordinated in advance, so the day itself is smoother." },
  { stage: "Family Communication", body: "Structured updates to family, where you've authorized it — especially useful if they're in another city." },
  { stage: "Discharge", body: "Support right through to when you actually leave the hospital." },
  { stage: "Experience Closure", body: "A final check-in to make sure nothing was left unresolved." },
];

const MEMBERSHIP_VALUE = [
  {
    icon: Zap,
    title: "Priority Relationship Officer Dispatch",
    body: "On the Doctor + Healthcare Concierge plan, RO assignment becomes instant/priority — in some cases within 20 minutes. Even during an emergency or urgent admission, there's no waiting around: a dedicated person is available almost immediately to begin counselling, coordination and guidance.",
  },
  {
    icon: UserCheck,
    title: "A Senior Family Care Manager, Not Just an RO",
    body: "Membership adds a dedicated senior family care manager who oversees the entire admission-to-discharge journey — an extra layer of oversight beyond day-to-day coordination. Especially reassuring for elderly patients, longer treatments, or complex cases.",
  },
  {
    icon: Stethoscope,
    title: "Second-Opinion Consultation Coordination",
    body: "Before any major diagnosis or treatment decision, a second expert opinion can be arranged easily through your Relationship Officer — reducing confusion and anxiety, without your family having to search for and arrange another doctor themselves.",
  },
  {
    icon: MessageCircle,
    title: "Multi-Channel Family Group Updates",
    body: "If relatives are in another city or country, they no longer need to call repeatedly for news. Structured, authorized updates reach the whole family automatically — reducing pressure on whoever is at the hospital.",
  },
  {
    icon: Ambulance,
    title: "Verified Ambulance & Medical-Travel Coordination",
    body: "If a referral to another facility or emergency transport is needed, a verified, coordinated arrangement is already in place — instead of your family having to source transport at the last minute during a stressful moment.",
  },
];

const FAMILY_PROBLEM_QUESTIONS = [
  "Who should we call?",
  "Where should we go?",
  "Who will arrange the appointment?",
  "What happens if we need a specialist or hospital?",
  "Who will keep the family updated?",
];

const YOUR_DOCTOR_ROLE = [
  { icon: CalendarCheck, text: "Regular consultations and follow-ups" },
  { icon: HeartHandshake, text: "Ongoing medical relationship" },
  { icon: Stethoscope, text: "Clinical guidance and referrals when needed" },
];

const YOUR_CONCIERGE_ROLE = [
  { icon: CalendarCheck, text: "Appointment coordination" },
  { icon: Stethoscope, text: "Specialist coordination" },
  { icon: Building2, text: "Hospital coordination" },
  { icon: ClipboardList, text: "Diagnostics coordination" },
  { icon: ShieldCheck, text: "Admission & discharge assistance" },
  { icon: Users, text: "Family & NRI updates" },
  { icon: Plane, text: "Medical travel coordination" },
];

const CORE_RO_SUPPORT = [
  "Counselling on treatment and related procedures.",
  "Clear explanation of treatment plans, investigations, procedures and packages.",
  "Coordination across admission, investigations, procedures and discharge.",
  "Explanation of hospital services, packages, billing and applicable policies.",
  "Prompt, professional handling of queries and concerns.",
  "Confidentiality of patient information at every step.",
];

export default function ForPatients() {
  useSEO({
    path: "/for-patients",
    title: `${BRAND} Concierge — One Membership. One Doctor. One Healthcare Concierge.`,
    description:
      "A dedicated concierge doctor owns your medical relationship, and ROSKYRO coordinates everything that doctor refers you to.",
  });

  return (
    <div className="bg-parchment min-h-screen">

      {/* Hero Section — matches the For Hospitals / Join ROSKYRO pillar hero */}
      <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-6">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Pillar 02 · For Patients &amp; Families</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Someone By Your Side, From Admission to Discharge
          </h1>

          <p className="text-white/80 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg mb-8">
            A dedicated, background-verified ROSKYRO Relationship Officer walks with you and your family through
            every stage of a hospital stay — explaining, coordinating and keeping everyone informed, so you can
            focus on what matters.
          </p>

          <div className="max-w-xl mx-auto mb-10 flex items-start gap-3 text-left bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
            <Quote className="w-5 h-5 text-violet-300 shrink-0 mt-0.5" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed italic">
              ROSKYRO = Healthcare Concierge + Patient Assistance + Hospital Partnership Platform. ROSKYRO does not
              provide treatment — it provides support, coordination and assistance to the patient and family around
              the treatment.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#membership"
              className="px-7 py-3.5 rounded-full bg-brand-gradient hover:brightness-110 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all"
            >
              <span>View Membership Plans</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              to="/login"
              className="px-6 py-3.5 rounded-full border border-white/25 hover:border-white/40 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base flex items-center gap-2 transition-all"
            >
              <UserCheck className="w-4 h-4 text-violet-300" />
              <span>Member Login</span>
            </Link>

            <a
              href={BOOK_WA_LINK}
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

      {/* Healthcare shouldn't feel like a series of appointments — the
          problem families face, and the ROSKYRO solution, framed from
          the patient/family side */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-violet">Why ROSKYRO</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-4">
            Healthcare Shouldn&rsquo;t Feel Like a Series of Appointments
          </h2>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed">
            When you or your parents need regular medical care, the difficult part isn&rsquo;t always finding a doctor.
            It&rsquo;s everything around the doctor.
          </p>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed mt-2">
            Appointments. Follow-ups. Specialists. Hospitals. Diagnostics. Admission. Discharge. Keeping the family informed.
          </p>
        </div>

        {/* The problem */}
        <div className="bg-clay/5 border border-clay/20 rounded-3xl p-6 sm:p-10 mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-clay">The Problem</span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-ink mt-2 mb-3">
            With every new medical need, families often have to start coordinating all over again.
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {FAMILY_PROBLEM_QUESTIONS.map((q) => (
              <div key={q} className="flex items-start gap-2.5 bg-white border border-clay/20 rounded-xl p-3.5">
                <HelpCircle className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mt-6">
            For older adults and people who need regular care, this coordination can become a constant responsibility.
          </p>
        </div>

        {/* The ROSKYRO solution */}
        <div className="bg-ink text-white rounded-3xl p-6 sm:p-10">
          <span className="text-xs font-bold tracking-widest uppercase text-flare">The ROSKYRO Solution</span>
          <h3 className="font-display text-xl sm:text-2xl font-bold mt-2 mb-3">
            One Trusted Doctor. One Healthcare Concierge.
          </h3>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
            With a ROSKYRO Doctor Concierge Membership, you stay connected with your regular doctor for ongoing care.
            And ROSKYRO takes care of the coordination around that care.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
              <div className="font-display text-base sm:text-lg font-bold text-white mb-4">Your Doctor</div>
              <div className="space-y-3">
                {YOUR_DOCTOR_ROLE.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <Icon className="w-4 h-4 text-violet-300 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
              <div className="font-display text-base sm:text-lg font-bold text-white mb-4">Your ROSKYRO Concierge</div>
              <div className="space-y-3">
                {YOUR_CONCIERGE_ROLE.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <Icon className="w-4 h-4 text-flare shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-8 text-center space-y-2">
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              You stay connected to your doctor. We stay connected to everything around your care.
            </p>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
              So instead of managing healthcare one appointment at a time, you have a team that helps coordinate your healthcare journey over time.
            </p>
            <p className="text-flare text-sm sm:text-base font-bold pt-2">
              One Doctor for continuity. One Concierge for everything around care.
            </p>
          </div>
        </div>
      </div>

      <ConciergeMembershipSection />

      {/* What's included / what's not */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-5 grid sm:grid-cols-2 gap-5">
          <div className="bg-white border border-ink/10 rounded-card p-6">
            <div className="w-10 h-10 rounded-xl bg-violet/10 text-violet flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="font-semibold text-ink mb-1.5">What your Relationship Officer does</div>
            <p className="text-sm text-ink/60 leading-relaxed">
              Non-medical coordination and assistance — admission formalities, investigation and department
              coordination, billing guidance, discharge coordination, and keeping your family informed where
              you've authorized it.
            </p>
          </div>
          <div className="bg-white border border-ink/10 rounded-card p-6">
            <div className="w-10 h-10 rounded-xl bg-clay/10 text-clay flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="font-semibold text-ink mb-1.5">What stays with your doctor</div>
            <p className="text-sm text-ink/60 leading-relaxed">
              Every treatment-related decision. Your Relationship Officer is not a medical attendant — they're your
              point person for everything around the medicine, so your doctor and clinical team can focus on the
              medicine itself.
            </p>
          </div>
        </div>
      </div>

      {/* Journey stages */}
      <div className="max-w-4xl mx-auto px-5 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-violet">Through your stay</span>
          <h2 className="font-display text-3xl text-ink mt-3">Support at every stage</h2>
        </div>
        <div className="space-y-3">
          {JOURNEY.map((item) => (
            <div key={item.stage} className="flex gap-4 border border-ink/10 rounded-card p-5">
              <div className="w-1 rounded-full bg-brand-gradient shrink-0" />
              <div>
                <div className="font-semibold text-ink mb-1">{item.stage}</div>
                <p className="text-sm text-ink/60 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why membership matters — the same guide facts, read from the
          patient/family side rather than the hospital side */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-violet">Why Membership Matters</span>
            <h2 className="font-display text-3xl text-ink mt-3 mb-3">For You &amp; Your Family, Not Just the Hospital</h2>
            <p className="text-sm text-ink/60 leading-relaxed">
              Membership makes this support faster, senior-level, and continuous — all through one trusted concierge relationship.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {MEMBERSHIP_VALUE.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white border border-ink/10 rounded-card p-6">
                <div className="w-10 h-10 rounded-xl bg-violet/10 text-violet flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-ink mb-1.5">{title}</div>
                <p className="text-sm text-ink/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-ink/10 rounded-card p-6 sm:p-8">
            <div className="font-semibold text-ink mb-4">Included with every membership, regardless of plan</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {CORE_RO_SUPPORT.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet shrink-0 mt-0.5" />
                  <p className="text-sm text-ink/60 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink/40 mt-5">
              Membership simply makes this support continuous and prioritized — you don't have to chase different departments to get any of it.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mt-10 relative bg-ink text-white rounded-card p-6 sm:p-8">
            <Quote className="w-6 h-6 text-white/30 absolute top-5 left-5" />
            <p className="pl-8 text-sm sm:text-base text-white/85 leading-relaxed italic">
              Membership gives you faster access, senior-level oversight, second opinions, family-wide communication, and emergency logistics — all through one trusted concierge relationship. This is what makes the hospital journey feel less confusing and more reassuring, for the people living through it.
            </p>
          </div>
        </div>
      </div>

      {/* Priority Access to doctors & hospitals — a membership benefit, not
          a separate service. Surfaced here so members know it's included. */}
      <div className="max-w-4xl mx-auto px-5 pb-20">
        <div className="bg-violet/5 border border-violet/15 rounded-card p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <span className="text-xs font-bold tracking-widest uppercase text-violet">Included with your membership</span>
            <h3 className="font-display text-2xl text-ink mt-2 mb-2">Priority Access to doctors &amp; hospitals</h3>
            <p className="text-sm text-ink/60 leading-relaxed">
              ROSKYRO Concierge members get priority appointments with our verified network of doctors and
              hospitals — search the directory and your concierge confirms the rest.
            </p>
          </div>
          <Link
            to="/membership/priority-access"
            className="px-6 py-3 rounded-full bg-brand-gradient text-white font-semibold whitespace-nowrap"
          >
            Explore Priority Access
          </Link>
        </div>
      </div>

      {/* Closing CTA */}
      <div className="bg-ink text-white">
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl mb-4">Admitted at a ROSKYRO partner hospital?</h2>
          <p className="text-white/70 mb-8">
            Your Relationship Officer will reach out directly — but if you need to speak to ROSKYRO before that,
            we're a message away.
          </p>
          <a
            href={BOOK_WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-ink font-semibold hover:scale-[1.02] transition-transform"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp: {SUPPORT_PHONE_DISPLAY}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
