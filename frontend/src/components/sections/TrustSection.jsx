import { ShieldCheck, UserCheck, PhoneCall, HeartHandshake, Award, BadgeCheck } from "lucide-react";

const VERIFICATIONS = [
  { icon: BadgeCheck, title: "Aadhaar Identity", desc: "Government photo identity verified against UIDAI databases prior to onboarding." },
  { icon: ShieldCheck, title: "Police Background Check", desc: "Formal criminal record and local police verification filed on record." },
  { icon: PhoneCall, title: "Dual Professional References", desc: "Past healthcare or service references verified directly by our compliance team." },
  { icon: HeartHandshake, title: "Empathy & Conduct Interview", desc: "In-person character, psychological maturity, and bedside manner evaluation." },
  { icon: Award, title: "5-Day Concierge Training", desc: "Hospital navigation, patient ethics, confidentiality, and infection safety training." },
  { icon: UserCheck, title: "Digital ID & Uniform", desc: "Official verified ROSKYRO uniform and digital QR credential verified on every hospital floor." },
];

export default function TrustSection() {
  return (
    <section id="trust" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>The Gold Standard of Safety</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-3">
            Every Officer Passes 6 Strict Verification Steps
          </h2>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed">
            Hospitals and families place their trust in us. We ensure every single Relationship Officer is thoroughly verified, professionally certified, and accountable.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {VERIFICATIONS.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-2xl border border-ink/10 p-6 bg-slate-50/50 hover:bg-white hover:border-violet/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet/10 text-violet flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-ink text-base mb-1.5">{v.title}</div>
                <div className="text-xs sm:text-sm text-ink-muted leading-relaxed">{v.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
