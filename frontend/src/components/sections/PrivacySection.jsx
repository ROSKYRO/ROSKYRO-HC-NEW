import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, BOOK_WA_LINK } from "../../config";

const CLAUSES = [
  {
    icon: "📋",
    title: "What we collect",
    body: "Customers/members: name, phone, email, preferred language, and booking or membership details. Hospital patient cases: patient name, age, an attendant's name and phone, ward/room, and a short coordination note (e.g. 'post-op, needs help with mobility') — never a diagnosis or medical record. Doctors, Relationship Officers, hospital staff, and Partners: the details needed to verify and assign them (name, phone, role, capacity, availability, rates).",
  },
  {
    icon: "📍",
    title: "Discharge photo & location",
    body: "When a Relationship Officer confirms a hospital patient's discharge, we capture a timestamped photo and GPS location through their personal link, purely as proof that discharge happened at that place and time. This is used only for discharge verification and, if the hospital disputes it, for resolving that dispute — never for tracking an officer's movements otherwise.",
  },
  {
    icon: "🎯",
    title: "Why we collect it",
    body: "Only to schedule and deliver a service, coordinate a membership or hospital case, send updates over WhatsApp, take payment, compute billing (like a hospital's per-day rate or a membership invoice), and resolve disputes fairly. Nothing else.",
  },
  {
    icon: "🔒",
    title: "Who can see it — data is scoped by role",
    body: "A concierge doctor sees only the members assigned to them. Hospital staff see only their own hospital's patient cases and invoices. A Relationship Officer sees only the case(s) assigned to them for that day. Beyond that, only the ROSKYRO team can see the full picture. We never sell or rent data to advertisers or third parties, and we don't use third-party ad-tracking scripts on our site.",
  },
  {
    icon: "🔗",
    title: "No-login portal links",
    body: "Doctors, Relationship Officers, and hospital staff are given a personal link or login instead of a public sign-up — it's a long, hard-to-guess token scoped to only their own data. Links can expire and can be regenerated (instantly disabling the old one) if lost, shared by mistake, or if the person's role changes.",
  },
  {
    icon: "💬",
    title: "WhatsApp & payments",
    body: "Messages and document sharing go through WhatsApp under their own privacy terms. Payments are made directly via UPI — we don't store your bank or card details.",
  },
  {
    icon: "🩺",
    title: "Health information",
    body: "For ROSKYRO Concierge members, medical documents and reports are shared directly with your concierge doctor over WhatsApp — we don't store the file or its contents in our systems, only a title and status so both sides can track it. For hospital patient cases, the only health-related detail we keep is the short coordination note described above, not a clinical record.",
  },
  {
    icon: "🗂️",
    title: "How long we keep it",
    body: "We keep booking, membership, and patient-case records for as long as needed for service, billing, dispute resolution, and legal requirements (e.g. invoice history), then remove what we no longer need.",
  },
  {
    icon: "✋",
    title: "Your choices",
    body: "You can ask us what we hold about you, correct your name/phone/email, or deactivate your account — email or call us and our team can make the change directly. Where the law allows, you can also request deletion of your data once there's no active booking, membership, or billing reason to keep it.",
  },
];

export default function PrivacySection() {
  return (
    <section id="privacy" className="bg-mist py-20">
      <div className="max-w-4xl mx-auto px-5">
        <span className="text-xs font-semibold tracking-wide text-magenta">Your information, handled with care</span>
        <h2 className="font-display text-3xl text-ink mt-3 mb-8">Privacy Policy</h2>
        <p className="text-ink/60 mb-8">
          This covers every ROSKYRO service — Partner bookings, the Concierge membership, the
          Hospital Concierge Program, and Priority Access. We collect only what we need to
          coordinate good care, and we never sell your data. Here's exactly what we keep, why,
          and who can see it.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {CLAUSES.map((c) => (
            <div key={c.title} className="bg-parchment rounded-card border border-ink/10 p-5">
              <div className="font-semibold text-ink mb-1">{c.icon} {c.title}</div>
              <p className="text-sm text-ink/60 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/40 mt-8">
          Privacy questions? Email {SUPPORT_EMAIL} or WhatsApp <a href={BOOK_WA_LINK} target="_blank" rel="noreferrer" className="underline font-semibold">{SUPPORT_PHONE_DISPLAY}</a>.
          Last updated {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.
        </p>
      </div>
    </section>
  );
}
