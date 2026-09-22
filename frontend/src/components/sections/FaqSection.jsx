import { useState } from "react";
import { Building2, HeartHandshake, UserPlus, HelpCircle } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "hospitals", label: "For Hospitals", icon: Building2 },
  { id: "patients", label: "For Patients & Families", icon: HeartHandshake },
  { id: "officers", label: "Join ROSKYRO", icon: UserPlus },
];

const FAQS = [
  // For Hospitals
  {
    category: "hospitals",
    q: "How does the Patient Concierge Program integrate with our hospital?",
    a: "Integration requires zero workflow changes or IT software. Patients admitted through your existing registration counter are simply flagged for ROSKYRO concierge. A dedicated Relationship Officer is assigned to that bed within 30 minutes to manage non-clinical paperwork, family coordination, and discharge guidance.",
  },
  {
    category: "hospitals",
    q: "Is there any payroll or hiring burden on the hospital?",
    a: "None at all. ROSKYRO recruits, background-verifies, trains, pays, and manages its own full-time Relationship Officer workforce. Your hospital gets dedicated, uniformed staff presence with zero HR overhead.",
  },
  {
    category: "hospitals",
    q: "How do Relationship Officers assist clinical staff?",
    a: "Officers handle routine non-clinical tasks that traditionally bog down nursing desks: answering family queries, coordinating patient escort to scan and radiology rooms, assisting with insurance approvals, and preparing discharge clearances in advance.",
  },
  {
    category: "hospitals",
    q: "What is the Hospital Console?",
    a: "The ROSKYRO Hospital Console is a secure, real-time portal where hospital administrators and nursing in-charges can see assigned officers, patient stage milestones (investigations, procedures, billing, discharge readiness), and daily care logs.",
  },

  // For Patients & Families
  {
    category: "patients",
    q: "What exactly does my Relationship Officer do during my hospital stay?",
    a: "Your officer meets you upon admission and serves as your dedicated point person throughout your stay. They assist with admission formalities, guide you through billing and insurance paperwork, coordinate scan appointments, run non-clinical errands, and keep your family informed.",
  },
  {
    category: "patients",
    q: "Does the Relationship Officer provide medical treatment?",
    a: "No. All medical diagnosis, prescribing, and treatment remain strictly in the hands of your licensed doctors and nurses. Your officer handles logistics and navigation around the medicine, allowing your doctors to focus purely on your care.",
  },
  {
    category: "patients",
    q: "What is the ROSKYRO Concierge VIP Membership plan?",
    a: "We offer the Doctor + Healthcare Concierge membership — a dedicated concierge doctor for your ongoing care, plus ROSKYRO coordinating everything that doctor refers you to: hospital visits, diagnostics, ambulance dispatch, and scheduled accompaniment. There's no fixed fee — pricing depends on the doctor's specialization and your care needs, shared after a quick call.",
  },
  {
    category: "patients",
    q: "Can I arrange hospital support for my elderly parents while living in another city?",
    a: "Yes! Many of our members are sons, daughters, and NRIs who want to ensure their elderly parents in Ambikapur have trusted physical assistance. Your officer sends you authorized photo check-ins and progress updates after every visit.",
  },

  // For Officers & Partners
  {
    category: "officers",
    q: "What are the qualifications required to become a ROSKYRO Relationship Officer?",
    a: "We look for empathetic, organized individuals with a minimum 12th pass or graduate education, clean police verification, local language fluency, and a passion for helping patients. Prior experience in healthcare or customer assistance is a bonus.",
  },
  {
    category: "officers",
    q: "How does payment and payout work?",
    a: "Officers earn a dependable base salary plus daily coverage incentives. Payouts are transferred directly to your bank account or UPI every single week — no waiting till month-end.",
  },
  {
    category: "officers",
    q: "What insurance and benefits are provided to officers?",
    a: "Every verified officer receives accidental insurance from day one, comprehensive health insurance upon qualifying, professional uniform kits, and 12 paid annual leaves.",
  },
  {
    category: "officers",
    q: "What is the training and certification process?",
    a: "Selected candidates undergo our rigorous 5-day Hospital Navigation & Compassion Training covering hospital ethics, patient privacy protocols, patient escort safety, and digital console reporting.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink/10 py-4 sm:py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left font-semibold text-ink hover:text-violet transition-colors gap-4"
      >
        <span className="text-sm sm:text-base">{q}</span>
        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-violet text-sm shrink-0 font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <p className="text-xs sm:text-sm text-ink-muted mt-3 leading-relaxed pr-6">{a}</p>}
    </div>
  );
}

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all" 
    ? FAQS 
    : FAQS.filter(f => f.category === activeCategory);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-10">
        <span className="text-xs font-bold tracking-widest uppercase text-violet">Questions Answered</span>
        <h2 className="font-display text-3xl sm:text-4xl text-ink font-bold mt-2">
          Frequently Asked Questions
        </h2>
        <p className="text-ink-muted text-sm mt-3">
          Clear answers tailored to hospitals, patients, and prospective relationship officers.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === id
                ? "bg-violet text-white shadow-xs"
                : "bg-slate-100 text-ink/70 hover:bg-slate-200"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="divide-y divide-ink/10 bg-white rounded-2xl border border-ink/10 px-6 sm:px-8 shadow-xs">
        {filtered.map((f) => (
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </section>
  );
}
