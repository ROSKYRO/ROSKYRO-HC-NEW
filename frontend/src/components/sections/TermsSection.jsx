import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, BOOK_WA_LINK, GSTIN_PLACEHOLDER, PILOT_CITY } from "../../config";

// Grouped by service line so members/hospitals/partners can each jump to the
// part that actually applies to them, instead of one flat wall of clauses.
const GROUPS = [
  {
    heading: "All ROSKYRO services",
    items: [
      {
        icon: "🧭",
        title: "What ROSKYRO is",
        body: "ROSKYRO runs four connected services: on-demand Partner assistance (non-medical help — hospital attendance, elderly companionship, errands), the ROSKYRO Concierge membership (a partnered doctor for ongoing health coordination), the Hospital Concierge Program (a dedicated Relationship Officer for a hospitalised patient, billed to the hospital), and Priority Access (referrals to outside doctors/hospitals for faster appointments). None of these make ROSKYRO a hospital, clinic, or medical practice — see 'Emergencies' and 'Not medical treatment' below.",
      },
      {
        icon: "🚑",
        title: "Emergencies",
        body: "For any medical emergency, call 102 / 108 (ambulance) first. A Partner, Relationship Officer, or concierge doctor may assist by being present or coordinating, but ROSKYRO never replaces professional emergency care, and no ROSKYRO staff member should be relied on as the first responder.",
      },
      {
        icon: "🩺",
        title: "Not medical treatment",
        body: "Partners and Relationship Officers are trained non-medical assistants; they do not diagnose, prescribe, or administer treatment. Concierge and Priority Access doctors are independent, licensed professionals — any diagnosis, prescription, or treatment is solely between you and that doctor, under their own professional responsibility, not ROSKYRO's.",
      },
      {
        icon: "🤝",
        title: "Your responsibilities",
        body: "Provide a safe, lawful setting and accurate details (about the person needing care, the task, or the patient), and treat Partners, Officers, and staff with respect. We may end a service, close a membership, or decline future bookings in cases of abuse, unsafe conditions, or false information.",
      },
    ],
  },
  {
    heading: "ROSKYRO Concierge membership",
    items: [
      {
        icon: "📋",
        title: "How membership works",
        body: "After you enquire (on the website or by call), our concierge team discusses your needs and finalises a fee for your case — there is no fixed price list, since the fee depends on the assigned doctor and your requirements. A concierge doctor is then assigned to you, subject to that doctor's available capacity; ROSKYRO may reassign you to a different doctor with similar experience if your doctor is unavailable or at capacity, and will tell you when this happens.",
      },
      {
        icon: "🔁",
        title: "Billing & renewal",
        body: "Membership is billed on an annual cycle. We raise an invoice at renewal; payment is confirmed once received via UPI. If an invoice remains unpaid past its due date, ROSKYRO may pause concierge coordination for that membership until it is settled or the plan is cancelled.",
      },
      {
        icon: "☎️",
        title: "What the doctor relationship covers",
        body: "The concierge doctor helps you navigate appointments, coordinate care, and log consultations through their own portal. This is a coordination and access service — it does not guarantee any specific medical outcome, and the doctor's clinical decisions are theirs alone.",
      },
    ],
  },
  {
    heading: "Hospital Concierge Program",
    items: [
      {
        icon: "🏥",
        title: "How a patient case works",
        body: "When a hospital opens a case with us, ROSKYRO assigns one Relationship Officer per day to be present with the patient. The hospital sets its own charge to the patient (not tracked by ROSKYRO); separately, the hospital pays ROSKYRO a per-patient daily rate, fixed at the rate on file for that hospital on the day the case is opened — a later rate change never rewrites an already-open case's billing.",
      },
      {
        icon: "✅",
        title: "Discharge confirmation",
        body: "Discharge is confirmed by the assigned Relationship Officer alone, using a personal link, with a timestamped photo and location as proof. The hospital is notified immediately and has a dispute window (typically 48 hours) to raise an objection before the case is treated as settled and billing stops. If either side becomes unresponsive, a ROSKYRO admin may force-close the case, recording a reason.",
      },
      {
        icon: "💳",
        title: "Hospital billing",
        body: "ROSKYRO invoices the hospital periodically for discharged, unbilled cases at the snapshotted daily rate. Payment is confirmed once received. Hospitals can raise a billing dispute for any specific case within the discharge dispute window described above.",
      },
    ],
  },
  {
    heading: "Priority Access & no-login links",
    items: [
      {
        icon: "🔗",
        title: "Priority Access referrals",
        body: "Priority Access connects you to an outside doctor or hospital on our referral list for a faster appointment. That doctor/hospital's own fees, availability, and quality of care are theirs to set and deliver — ROSKYRO facilitates the introduction and does not guarantee appointment timing, treatment outcomes, or pricing at the external provider.",
      },
      {
        icon: "📱",
        title: "No-login portal links",
        body: "Doctors, Relationship Officers, and hospital staff are given a personal link or login scoped only to their own assigned members, cases, or hospital. These are not to be shared; a leaked link may expose real member/patient information to whoever holds it. ROSKYRO can deactivate or regenerate any link on request, which instantly invalidates the old one.",
      },
    ],
  },
  {
    heading: "Liability, incidents & changes",
    items: [
      {
        icon: "🛡️",
        title: "Liability & disputes",
        body: "We take reasonable care in selecting and verifying Partners, Officers, and referral doctors/hospitals, but to the extent allowed by law, our liability for any single booking, membership period, or patient case is limited to that booking/case's value. Please report any incident within 24 hours of it happening so we can document and resolve it fairly.",
      },
      {
        icon: "🚨",
        title: "Safety, property & incidents",
        body: "For a medical or safety emergency, always call 108/112 first. Safety concerns reach our founders directly. For minor accidental damage caused by a Partner or Officer, we may at our discretion make a goodwill payment of up to ₹2,000 per incident; where fault is established, our aggregate liability is limited to ₹10,000 per incident. Partners and Officers do not handle cash, cards, OTPs, or valuables, and do not administer medicines.",
      },
      {
        icon: "🩺",
        title: "Health information you share with us",
        body: "Coordination sometimes involves health-related information — appointment reasons, a short patient condition note, or documents shared with a doctor. We use this only for the immediate coordination task; see our Privacy Policy for exactly what we store versus what stays on WhatsApp or with your doctor.",
      },
      {
        icon: "📝",
        title: "Changes to these terms",
        body: "We may update these terms as our services evolve (e.g. as membership or hospital program details change). We'll post the updated date below; continuing to use ROSKYRO's services after an update means you accept the revised terms.",
      },
    ],
  },
];

export default function TermsSection() {
  return (
    <section id="terms" className="max-w-4xl mx-auto px-5 py-20">
      <span className="text-xs font-semibold tracking-wide text-magenta">The fine print, in plain words</span>
      <h2 className="font-display text-3xl text-ink mt-3 mb-8">Terms of Service</h2>
      <p className="text-ink/60 mb-10">
        Short, clear, and fair — these keep you, our members, our hospital partners, and our
        Partners/Officers safe. By using any ROSKYRO service (Partner bookings, Concierge
        membership, the Hospital Concierge Program, or Priority Access), you agree to these terms.
      </p>
      <div className="space-y-12">
        {GROUPS.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-magenta/80 mb-4">{group.heading}</h3>
            <div className="space-y-6">
              {group.items.map((c) => (
                <div key={c.title}>
                  <div className="font-semibold text-ink mb-1">
                    <span className="mr-1">{c.icon}</span>
                    {c.title}
                  </div>
                  <p className="text-sm text-ink/60 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink/40 mt-10">
        Questions about these terms? Email {SUPPORT_EMAIL} or WhatsApp <a href={BOOK_WA_LINK} target="_blank" rel="noreferrer" className="underline font-semibold">{SUPPORT_PHONE_DISPLAY}</a>.
        GSTIN: {GSTIN_PLACEHOLDER} · Pilot terms, {PILOT_CITY} — last updated {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.
      </p>
    </section>
  );
}
