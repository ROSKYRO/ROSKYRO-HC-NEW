import { Link } from "react-router-dom";
import {
  Stethoscope, ArrowRight, MessageSquare, CheckCircle2, Scale, ShieldCheck,
  Building2, FileText, Users, PlaneTakeoff, HeartHandshake,
} from "lucide-react";
import { BRAND, WHATSAPP_BOOKING_NUMBER, waLink, SUPPORT_PHONE_DISPLAY } from "../config";
import useSEO from "../hooks/useSEO";
import PriorityAccessFinder from "../components/sections/PriorityAccessFinder";

const JOIN_WA_LINK = waLink(
  WHATSAPP_BOOKING_NUMBER,
  `Hi ${BRAND}, I'd like to know more about the Doctor + Healthcare Concierge membership.`
);

const WHAT_YOUR_DOCTOR_DOES = [
  "Owns your ongoing medical relationship — regular check-ups, follow-ups, and preventive care",
  "Priority appointment access whenever you need to be seen",
  "Refers you onward to specialists, hospitals, or diagnostics whenever your care needs it",
];

const WHAT_ROSKYRO_MANAGES = [
  { icon: Building2, title: "Hospital & specialist coordination", body: "Every referral your doctor makes — appointments, admissions, specialist bookings — coordinated end to end." },
  { icon: FileText, title: "Admission & discharge assistance", body: "Paperwork, formalities, and logistics handled around you, from the moment you're admitted to the moment you leave." },
  { icon: HeartHandshake, title: "Reasonable physical assistance", body: "On-the-ground help getting to appointments or through a hospital visit — reasonable, subject to the membership's fair-use policy." },
  { icon: Users, title: "Family & NRI updates", body: "Structured updates to family — especially useful if they're in another city or country." },
  { icon: PlaneTakeoff, title: "Medical travel coordination", body: "When a referral means travelling for care, ROSKYRO coordinates the logistics around it." },
];

export default function DoctorConciergePlan() {
  useSEO({
    path: "/membership/doctor-concierge",
    title: `${BRAND} Doctor + Healthcare Concierge — One Doctor. One Concierge.`,
    description:
      "A dedicated concierge doctor owns your ongoing medical relationship. ROSKYRO manages everything that doctor refers you to — unlimited concierge coordination, priority doctor access, and reasonable physical assistance under the membership's fair-use policy.",
  });

  return (
    <div>
      {/* Hero */}
      <div className="bg-brand-gradient text-white">
        <div className="max-w-4xl mx-auto px-5 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase opacity-85">
            <Stethoscope className="w-4 h-4" />
            Doctor + Healthcare Concierge Membership
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-3 mb-5">One Doctor. One Concierge.</h1>
          <p className="text-white/85 max-w-2xl mx-auto leading-relaxed text-lg">
            A dedicated concierge doctor manages your medical relationship. ROSKYRO manages everything that doctor
            refers you to — unlimited concierge coordination and priority doctor access, with reasonable physical
            assistance under the membership's fair-use policy.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              to="/membership/join?plan=doctor_concierge"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-ink font-semibold hover:scale-[1.02] transition-transform"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={JOIN_WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Priority Access finder — featured at the top since it's a core
          benefit of the Doctor + Healthcare Concierge plan: members use it
          to find a second specialist outside their doctor's referral. */}
      <div className="bg-slate-50 border-b border-ink/10">
        <PriorityAccessFinder showBreadcrumb={false} />
      </div>

      {/* One doctor */}
      <div className="max-w-4xl mx-auto px-5 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-violet">Your doctor</span>
          <h2 className="font-display text-3xl text-ink mt-3">What your concierge doctor does</h2>
        </div>
        <div className="space-y-3">
          {WHAT_YOUR_DOCTOR_DOES.map((item) => (
            <div key={item} className="flex gap-4 border border-ink/10 rounded-card p-5">
              <div className="w-1 rounded-full bg-brand-gradient shrink-0" />
              <p className="text-sm text-ink/70 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What ROSKYRO manages */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-violet">Your concierge</span>
            <h2 className="font-display text-3xl text-ink mt-3 mb-3">Everything your doctor refers you to</h2>
            <p className="text-sm text-ink/60 leading-relaxed">
              Whenever your concierge doctor refers you onward, ROSKYRO takes it from there.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHAT_ROSKYRO_MANAGES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white border border-ink/10 rounded-card p-6">
                <div className="w-10 h-10 rounded-xl bg-violet/10 text-violet flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-ink mb-1.5">{title}</div>
                <p className="text-sm text-ink/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unlimited + fair-use */}
      <div className="max-w-4xl mx-auto px-5 py-20">
        <div className="bg-ink text-white rounded-card p-8 sm:p-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl mb-2">Unlimited coordination, fairly used</h3>
              <p className="text-white/75 text-sm leading-relaxed">
                No hourly billing, and no per-visit or per-month cap for genuine, ongoing coordination needs —
                appointments, hospital & specialist coordination, admission/discharge assistance, and reasonable
                physical assistance are all included. "Unlimited" here means no artificial ceiling on legitimate
                support, not unrestricted, round-the-clock personal errands: your concierge will check in if usage
                looks unusual, same as any fair-use policy.
              </p>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 mt-6">
            {[
              "Unlimited concierge coordination",
              "Priority doctor access",
              "Reasonable physical assistance (fair-use policy)",
              "No hourly billing",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Not medical treatment */}
      <div className="max-w-4xl mx-auto px-5 pb-20">
        <div className="bg-white border border-ink/10 rounded-card p-6 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-violet shrink-0 mt-0.5" />
          <p className="text-sm text-ink/60 leading-relaxed">
            ROSKYRO Concierge coordinates your healthcare journey — it does not replace a doctor, nurse, or
            emergency service. For the full plan breakdown, pricing, billing terms, and the fair-use policy in
            detail, read the{" "}
            <Link to="/membership/info" className="text-violet font-semibold hover:underline">
              full membership information page
            </Link>.
          </p>
        </div>
      </div>

      {/* Closing CTA */}
      <div className="bg-ink text-white">
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl mb-4">Ready for one doctor, one concierge?</h2>
          <p className="text-white/70 mb-8">
            Enquire about the Doctor + Healthcare Concierge membership, or ask us anything first on WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/membership/join?plan=doctor_concierge"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-ink font-semibold hover:scale-[1.02] transition-transform"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={JOIN_WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp: {SUPPORT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
