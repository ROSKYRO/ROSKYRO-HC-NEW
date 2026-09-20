import { Quote, ArrowRight, ShieldCheck, HeartHandshake, MessageSquare, Crown } from "lucide-react";
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
