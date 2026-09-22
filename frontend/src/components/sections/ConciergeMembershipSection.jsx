import { Link } from "react-router-dom";
import { 
  Crown, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Stethoscope
} from "lucide-react";
import { WHATSAPP_BOOKING_NUMBER, waLink, BRAND } from "../../config";

function waFor(planName) {
  return waLink(
    WHATSAPP_BOOKING_NUMBER,
    `Hi ${BRAND}, I'd like to know more about the ${planName} membership plan.`
  );
}

const PLANS = [
  {
    id: "doctor_concierge",
    name: "Doctor + Healthcare Concierge",
    price: "Custom pricing",
    period: "based on your needs",
    tagline: "One Doctor. One Concierge.",
    icon: Stethoscope,
    desc: "A dedicated concierge doctor manages your medical relationship. ROSKYRO manages everything that doctor refers you to.",
    included: [
      "Dedicated concierge doctor for your ongoing care",
      "Unlimited concierge coordination",
      "Priority doctor access",
      "Hospital, specialist & diagnostic coordination on referral",
      "Admission & discharge assistance",
      "Reasonable physical assistance (subject to fair-use policy)",
      "Medical records & report coordination",
      "Family / NRI updates",
      "No hourly billing — unlimited coordination under fair-use policy",
    ],
    highlight: true,
  },
];

const COVERED = [
  "Healthcare concierge & appointment booking",
  "Hospital admission & discharge paperwork coordination",
  "Diagnostic & lab sample home collection coordination",
  "Medicine delivery facilitation & reminders",
  "Second opinion consultation coordination",
  "Real-time family WhatsApp status briefings",
];

const SEPARATE = [
  "Doctor / specialist direct OPD consultation fees",
  "Lab tests, MRI/CT scans & hospital admission bills",
  "Prescribed medicine & pharmacy bills",
  "Commercial ambulance base vehicle tariffs",
];

export default function ConciergeMembershipSection() {
  return (
    <>
      <section id="membership" className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-violet">
            <Crown className="w-4 h-4" />
            Choose Your Plan
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-3 mb-4">
            One Membership. One Doctor. One Healthcare Concierge.
          </h2>
          <p className="text-ink-muted text-sm sm:text-base">
            A dedicated concierge doctor owns your medical relationship, and ROSKYRO coordinates everything that
            doctor refers you to.
          </p>
        </div>


        {/* Pricing Cards */}
        <div className="grid gap-8 items-stretch mb-16 max-w-md mx-auto">
          {PLANS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className={`relative rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                  p.highlight
                    ? "border-2 border-violet shadow-2xl shadow-violet/15 bg-white ring-4 ring-violet/10 scale-[1.02] z-10"
                    : "border border-ink/10 bg-white hover:border-violet/30 hover:shadow-lg shadow-xs"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-gradient text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular Choice
                  </div>
                )}

                <div className="p-7 sm:p-8">
                  {/* Plan Top */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-soft text-violet flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-magenta bg-magenta/10 px-2.5 py-1 rounded-full">
                      {p.tagline}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-ink mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed mb-6">
                    {p.desc}
                  </p>

                  <div className="flex items-baseline gap-1.5 pb-2 mb-2 border-b border-ink/10">
                    <span className="font-display text-2xl font-bold text-ink tracking-tight">
                      {p.price}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mb-6">
                    {p.period} — depends on your doctor's specialization &amp; care needs, shared after a quick call.
                  </p>

                  {/* Included Feature List */}
                  <div className="space-y-2.5 mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-ink/40 mb-3">
                      What's Included:
                    </div>
                    {p.included.map((item) => (
                      <div key={item} className="flex items-start gap-2.5 text-xs text-ink/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="p-6 sm:p-8 pt-0 space-y-2.5">
                  <Link
                    to={`/membership/join?plan=${p.id}`}
                    className={`w-full py-3 px-4 rounded-full text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      p.highlight
                        ? "bg-brand-gradient text-white hover:opacity-95 shadow-md shadow-violet/20"
                        : "bg-ink text-white hover:bg-violet"
                    }`}
                  >
                    <span>Enquire Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={waFor(p.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-full border border-ink/15 text-center text-xs font-semibold text-ink/80 hover:border-violet hover:text-violet flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inquire via WhatsApp</span>
                  </a>

                  <div className="text-center pt-1">
                    <Link
                      to="/membership/doctor-concierge"
                      className="text-[11px] font-semibold text-violet hover:underline"
                    >
                      Learn more about this plan &amp; T&amp;C
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* What's Included vs What's Separate Card */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-ink/10">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-violet" />
            <h4 className="font-display text-xl font-bold text-ink">
              Transparent Membership Scope: What's Included vs. Billed Separately
            </h4>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 text-xs sm:text-sm">
            <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ROSKYRO Concierge Service Covers
              </div>
              <ul className="space-y-2 text-ink/75">
                {COVERED.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-xs">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Billed Directly by Medical Facilities
              </div>
              <ul className="space-y-2 text-ink/75">
                {SEPARATE.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-ink/10 text-xs text-ink/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p>
              💡 Doctor consultations, lab tests, medicines and hospital bills are always billed separately at their own rates.
            </p>
            <Link to="/membership/info" className="text-violet font-semibold hover:underline shrink-0">
              Read Detailed Membership FAQ →
            </Link>
          </div>
        </div>

        </div>
      </section>
    </>
  );
}
