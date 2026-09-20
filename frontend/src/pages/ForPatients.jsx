import { Quote, ArrowRight, ShieldCheck, HeartHandshake, MessageSquare, Crown, Zap, UserCheck, Stethoscope, MessageCircle, Ambulance, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BRAND, SUPPORT_PHONE_DISPLAY, BOOK_WA_LINK } from "../config";
import useSEO from "../hooks/useSEO";
import ConciergeMembershipSection from "../components/sections/ConciergeMembershipSection";

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
    body: "On Family & NRI Care plans, RO assignment becomes instant/priority — in some cases within 20 minutes. Even during an emergency or urgent admission, there's no waiting around: a dedicated person is available almost immediately to begin counselling, coordination and guidance.",
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
    title: `${BRAND} Concierge — VIP Annual Memberships`,
    description:
      "Choose an annual ROSKYRO Concierge plan — Care, Family or NRI Care — for a dedicated Relationship Officer and stress-free family health coordination.",
  });

  return (
    <div>
      {/* Hero */}
      <div className="bg-brand-gradient text-white">
        <div className="max-w-4xl mx-auto px-5 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase opacity-85">
            <Crown className="w-4 h-4" />
            VIP Annual Memberships
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-3 mb-5">One Trusted Concierge for Your Whole Healthcare Journey</h1>
          <p className="text-white/85 max-w-2xl mx-auto leading-relaxed text-lg">
            No more running between counters, chasing doctors, or worrying from another city. Choose an annual plan
            for ongoing, stress-free family health coordination.
          </p>
        </div>
      </div>

      {/* The introduction moment */}
      <div className="max-w-3xl mx-auto px-5 py-20">
        <div className="bg-slate-50 border border-ink/10 rounded-card p-8 sm:p-10 relative">
          <Quote className="w-8 h-8 text-violet/30 absolute top-6 left-6" />
          <div className="pl-8">
            <p className="text-xs font-bold tracking-widest uppercase text-violet mb-4">
              Within about 30 minutes of admission
            </p>
            <p className="text-lg sm:text-xl text-ink leading-relaxed font-medium">
              "Namaste, main {BRAND} se Relationship Officer hoon. Aapke hospital stay ke dauran main aapki
              non-medical coordination aur assistance mein help karunga. Treatment-related decisions aapke doctor aur
              clinical team handle karenge. Agar admission, investigation coordination, discharge ya kisi hospital
              process mein assistance chahiye, aap mujhse contact kar sakte hain."
            </p>
            <p className="text-sm text-ink/50 mt-6">
              From that moment, you know exactly one thing: there's a person responsible for you. That's the
              concierge experience.
            </p>
          </div>
        </div>
      </div>

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

      {/* VIP Membership plans — moved here from the homepage; this is what
          the "See how it works" / "VIP Membership" links across the site
          now point to (#membership) */}
      <ConciergeMembershipSection />

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
