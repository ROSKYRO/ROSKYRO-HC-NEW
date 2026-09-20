import { Building2, HeartHandshake, UserPlus, ArrowRight } from "lucide-react";

const GATEWAYS = [
  {
    icon: Building2,
    eyebrow: "Primary — For Hospitals & Hospital Groups",
    title: "Patient Concierge Program",
    body: "A dedicated Relationship Officer for every enrolled patient, from admission to discharge — no additional payroll for your hospital.",
    href: "/for-hospitals",
    cta: "Explore the program",
  },
  {
    icon: HeartHandshake,
    eyebrow: "For Patients & Families",
    title: "How Your ROSKYRO Concierge Supports You",
    body: "What a Relationship Officer actually does during a hospital stay — coordination and support, from admission through discharge.",
    href: "/for-patients",
    cta: "See how it works",
  },
  {
    icon: UserPlus,
    eyebrow: "For Relationship Officers",
    title: "Join ROSKYRO",
    body: "Real benefits, fair pay, and professional training — build a career as a ROSKYRO Relationship Officer.",
    href: "/become-a-partner",
    cta: "Apply now",
  },
];

export default function AudienceGatewaySection() {
  return (
    <section id="audience-gateway" className="bg-slate-50 border-b border-ink/5">
      <div className="max-w-6xl mx-auto px-5 pt-12 pb-14 sm:pt-16 sm:pb-16">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <span className="text-xs font-bold tracking-widest uppercase text-violet">ROSKYRO Healthcare Concierge</span>
          <h1 className="font-display text-2xl sm:text-3xl text-ink mt-3">Who are you here as?</h1>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {GATEWAYS.map(({ icon: Icon, eyebrow, title, body, href, cta }) => (
            <a
              key={href}
              href={href}
              className="group border border-ink/10 rounded-card p-6 sm:p-7 hover:border-violet/40 hover:shadow-lg hover:shadow-violet/5 transition-all bg-white flex flex-col"
            >
              <div className="w-11 h-11 rounded-xl bg-violet/10 text-violet flex items-center justify-center mb-5 group-hover:bg-violet group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-violet mb-2">{eyebrow}</span>
              <h2 className="font-display text-lg text-ink mb-2 leading-snug">{title}</h2>
              <p className="text-sm text-ink/60 leading-relaxed mb-5 flex-1">{body}</p>
              <span className="text-sm font-semibold text-violet flex items-center gap-1.5">
                {cta}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
