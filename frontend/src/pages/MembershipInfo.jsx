import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import { SUPPORT_EMAIL, WHATSAPP_SUPPORT_NUMBER, waLink, BRAND } from "../config";

// Full membership information page — everything a member should read before
// subscribing: what each plan includes/excludes, the free Relationship Officer-visit quota,
// billing & cancellation terms, and the privacy policy for health data.
// Linked from the homepage teaser (ConciergeMembershipSection) and required
// reading (checkbox gate) on the signup page (MembershipSignup) — this is the
// page of record, everywhere else is just a summary pointing here.

const PLANS = [
  {
    id: "doctor_concierge",
    name: "Doctor + Healthcare Concierge",
    tag: "One Doctor. One Concierge.",
    price: "Custom pricing",
    priceNote: "Depends on your doctor's specialization & care needs — shared after a quick call, no fixed fee.",
    who: "Anyone who wants a single dedicated doctor to own their ongoing medical relationship, with ROSKYRO handling everything that doctor refers them to.",
    desc: "Your doctor manages your health. ROSKYRO manages everything around it.",
    included: [
      "A dedicated concierge doctor for your ongoing medical relationship",
      "Unlimited concierge coordination",
      "Priority doctor access with your assigned doctor",
      "Preventive & ongoing health management",
      "Hospital, specialist & diagnostic coordination on referral",
      "Admission & discharge assistance",
      "Reasonable physical assistance, subject to the membership's fair-use policy",
      "Medical records & report coordination",
      "Family / NRI updates",
      "Medical travel coordination when required",
      "No hourly billing — unlimited coordination under the plan's fair-use policy",
    ],
    freeVisits: "Unlimited concierge coordination (fair-use policy applies)",
    popular: false,
  },
];

const COVERED = [
  "Healthcare concierge & coordination",
  "Appointment booking",
  "Hospital & discharge coordination",
  "Diagnostic coordination",
  "Follow-up reminders & family updates",
  "Network doctor consultations (yearly allowance — see below)",
  "Verified ambulance assists (yearly allowance — see below)",
  "Medical-travel assists (yearly allowance — see below)",
];

const SEPARATE = [
  "Lab tests, MRI/CT & imaging",
  "Medicines & pharmacy",
  "Hospital bill",
  "Ambulance",
  "Medical-travel",
];

const GOOD_TO_KNOW = [
  {
    icon: "💳",
    title: "Billing",
    body: "There is no fixed membership fee — your doctor's specialization and your family's actual care needs both move the price. Your concierge shares a price after understanding your needs on a call, and it's locked in for the year once you agree — it won't increase even if plan pricing changes later. Payment is confirmed via UPI on WhatsApp; no card details are collected on this site.",
  },
  {
    icon: "🔄",
    title: "Cancellation",
    body: "You can cancel your membership anytime by messaging your concierge on WhatsApp. Your membership stays active till the end of the billing period already paid for; the current period is non-refundable once billing is confirmed.",
  },
  {
    icon: "🚗",
    title: "Transport",
    body: "Same-city coordination is included in every plan. If a member is outside the city, your concierge still manages the full visit — but travel to the city is arranged and paid for by the member, not ROSKYRO.",
  },
  {
    icon: "👨‍⚕️",
    title: "Not medical treatment",
    body: "ROSKYRO Concierge coordinates your healthcare journey. It does not replace a doctor, nurse, or emergency service. For any medical emergency, always call 108/112 first.",
  },
  {
    icon: "⚖️",
    title: "Fair-use policy",
    body: "\"Unlimited\" coordination and physical assistance on the Doctor + Healthcare Concierge plan means no per-visit or per-month cap for genuine, ongoing coordination needs — not unrestricted, round-the-clock personal errands. Your concierge will flag it if usage looks unusual, and ROSKYRO may ask for a quick check-in before continuing support in such cases.",
  },
];

const PRIVACY_POINTS = [
  <>Health details you share (conditions, prescriptions, reports) are used <b>only to complete the specific coordination task</b> — like booking an appointment or arranging a diagnostic test.</>,
  <>Any document you share is <b>forwarded directly to your concierge</b> to act on — it is not kept as a permanent medical record in our systems.</>,
  <>We do keep basic contact details (name, phone, address) needed to deliver the service, and a simple status log of requests (e.g. "appointment booked", "resolved") for your own reference/history.</>,
  <>We never sell or share your information with third parties for marketing.</>,
  <>You can ask your concierge to delete any specific note or document reference at any time.</>,
];

const STEPS = [
  "Send us a quick inquiry — your name, phone, and what you need (e.g. a specialization, a family member's condition/age).",
  "A concierge calls you back to understand your requirement in detail.",
  "We share your membership price, based on that conversation — there's no fixed fee.",
  "Once you agree, we set up your account and your first invoice as pending.",
  "A concierge confirms your payment via UPI on WhatsApp, then starts coordinating from day one.",
];

export default function MembershipInfo() {
  useSEO({
    path: "/membership/info",
    title: `${BRAND} Concierge — Membership Information`,
    description:
      "What each ROSKYRO Concierge plan includes, what's billed separately, free Relationship Officer-visit quotas, billing & cancellation terms, and how we handle your health data.",
  });

  return (
    <div>
      {/* Hero */}
      <div className="bg-brand-gradient text-white text-center py-16 px-5">
        <div className="text-xs font-bold tracking-widest uppercase opacity-85 mb-2">Before you join</div>
        <h1 className="font-display text-3xl sm:text-[34px] mb-3">{BRAND} Concierge — Membership Information</h1>
        <p className="max-w-xl mx-auto text-[15.5px] opacity-95">
          Please read this page fully before subscribing. It explains exactly what each plan includes, what's
          billed separately, how billing &amp; cancellation work, and how we handle your information.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-5">

        {/* What is Concierge */}
        <section className="py-11">
          <h2 className="font-display text-[22px] text-ink mb-1.5">What is ROSKYRO Concierge?</h2>
          <p className="text-ink/60 text-[14.5px] leading-relaxed">
            ROSKYRO Concierge is a <b className="text-ink">recurring healthcare coordination membership</b> — a
            dedicated concierge who manages appointments, diagnostics, hospital visits and follow-ups for you or
            your family, end to end. It is <b className="text-ink">not medical treatment or medical advice</b>.
          </p>
        </section>

        <div className="h-px bg-border bg-mist" />

        {/* Plans */}
        <section className="py-11">
          <h2 className="font-display text-[22px] text-ink mb-1.5">The membership</h2>
          <p className="text-ink/60 text-[14.5px] mb-6 max-w-xl">
            One plan: a dedicated concierge doctor owns your medical relationship, and ROSKYRO coordinates
            everything that doctor refers you to.
          </p>

          <div className="grid gap-5 max-w-sm">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={
                  "relative rounded-2xl bg-white p-6 flex flex-col " +
                  (p.popular ? "p-[2px] bg-brand-gradient" : "border border-mist")
                }
              >
                <div className={p.popular ? "bg-white rounded-[14px] p-6 flex flex-col h-full" : "flex flex-col h-full"}>
                  {p.popular && (
                    <span className="absolute -top-2.5 left-5 bg-brand-gradient text-white text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                      Most popular
                    </span>
                  )}
                  <div className="text-[19px] font-bold text-ink">{p.name}</div>
                  <div className="text-magenta text-xs font-semibold mb-3.5">{p.tag}</div>
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-ink">{p.price}</span>
                  </div>
                  <p className="text-[12.5px] text-ink/50 mb-2">{p.priceNote}</p>
                  <div className="bg-mist rounded-lg px-3 py-2.5 text-[13px] text-ink my-3.5">
                    <b className="text-violet">Best for:</b> {p.who}
                  </div>
                  <p className="text-[13.5px] text-ink/60 mb-4">{p.desc}</p>
                  <ul className="space-y-1.5 mb-2 flex-1">
                    {p.included.map((item) => (
                      <li key={item} className="text-[13.5px] text-ink pl-5 relative">
                        <span className="absolute left-0 top-0.5 text-violet font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                    <li className="text-[13.5px] text-ink pl-5 relative font-semibold">
                      <span className="absolute left-0 top-0.5 text-violet font-bold">✓</span>
                      {p.freeVisits}
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-mist" />

        {/* What's included / separate */}
        <section className="py-11">
          <h2 className="font-display text-[22px] text-ink mb-1.5">What's included, what's billed separately</h2>
          <p className="text-ink/60 text-[14.5px] mb-6 max-w-xl">
            There are no hidden charges beyond what's listed here.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border border-mist rounded-2xl p-5">
              <h4 className="text-violet text-xs font-semibold uppercase tracking-wide mb-3">✅ Your membership covers</h4>
              <ul className="space-y-1.5 text-[13.5px] text-ink list-disc pl-4">
                {COVERED.map((item) => <li key={item}>{item}</li>)}
                <li><b>Free ROSKYRO Relationship Officer visits every month (see below)</b></li>
              </ul>
            </div>
            <div className="bg-white border border-mist rounded-2xl p-5">
              <h4 className="text-ink/50 text-xs font-semibold uppercase tracking-wide mb-3">Billed separately &amp; billed directly by medical facilities</h4>
              <ul className="space-y-1.5 text-[13.5px] text-ink list-disc pl-4">
                {SEPARATE.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-mist rounded-2xl px-5 py-4.5 text-[13.5px] text-ink border-l-4 border-violet mt-5">
            <b className="text-violet">Concierge coordination:</b>
            <br />
            Unlimited concierge coordination, subject to the plan's fair-use policy.
          </div>

          <div className="bg-mist rounded-2xl px-5 py-4.5 text-[13.5px] text-ink border-l-4 border-magenta mt-4">
            <b className="text-magenta">Annual allowances included every year:</b>
            <br />
            Priority doctor access with your assigned doctor, <b>4 ambulance assists</b>,{" "}
            <b>6 medical-travel assists</b>
            <br />
            These allowances reset once a year, with your membership's billing cycle.
          </div>

        </section>

        <div className="h-px bg-mist" />

        {/* Priority Access Network — a membership benefit, not a separate service */}
        <section className="py-11">
          <h2 className="font-display text-[22px] text-ink mb-1.5">Priority Access to doctors &amp; hospitals</h2>
          <p className="text-ink/60 text-[14.5px] mb-5 max-w-xl">
            All plans include Priority Access — search ROSKYRO's verified network of doctors and hospitals
            and request a priority appointment, which your concierge confirms. On the Doctor + Healthcare Concierge
            plan, this is on top of your dedicated concierge doctor — for when you need a second specialist outside
            their referral.
          </p>
          <Link
            to="/membership/priority-access"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet underline"
          >
            Browse the Priority Access directory →
          </Link>
        </section>

        <div className="h-px bg-mist" />

        {/* Good to know */}
        <section className="py-11">
          <h2 className="font-display text-[22px] text-ink mb-6">Good to know before you sign up</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {GOOD_TO_KNOW.map((c) => (
              <div key={c.title} className="bg-white border border-mist rounded-2xl p-5">
                <span className="text-xl block mb-2">{c.icon}</span>
                <h5 className="text-[14.5px] font-semibold text-ink mb-1.5">{c.title}</h5>
                <p className="text-[13.3px] text-ink/60 m-0">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-mist" />

        {/* Privacy */}
        <section className="py-11">
          <h2 className="font-display text-[22px] text-ink mb-6">Your data &amp; privacy</h2>
          <div className="bg-white border border-mist rounded-2xl p-6">
            <h4 className="text-[15px] font-semibold text-ink mt-0 mb-3">
              We do not permanently store your medical/health information.
            </h4>
            <ul className="space-y-2 text-[13.5px] text-ink list-disc pl-4">
              {PRIVACY_POINTS.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </div>
        </section>

        <div className="h-px bg-mist" />

        {/* How signup works */}
        <section className="py-11">
          <h2 className="font-display text-[22px] text-ink mb-6">How signing up works</h2>
          <ol className="space-y-1">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink py-1.5">
                <span className="flex-none w-[26px] h-[26px] rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="pb-11">
          <div className="bg-ink text-white rounded-2xl px-8 py-9 text-center">
            <h3 className="font-display text-xl mb-2">Ready to join?</h3>
            <p className="text-white/70 text-[13.5px] mb-5">Talk to us first on WhatsApp, or sign up directly on the site.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/membership/join"
                className="inline-block bg-brand-gradient text-white font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                Enquire for ROSKYRO Concierge
              </Link>
              <a
                href={waLink(WHATSAPP_SUPPORT_NUMBER, `Hi ${BRAND}, I have a question about the Concierge membership.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-block border border-white/25 text-white font-semibold text-sm px-6 py-3 rounded-full hover:border-white/50 transition-colors"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </section>

        <footer className="text-center text-[11.5px] text-ink/50 pb-10 pt-2">
          By subscribing to {BRAND} Concierge, you agree to the terms described on this page along with our
          general Terms of Service. Questions? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-violet">{SUPPORT_EMAIL}</a> or message us on
          WhatsApp.
        </footer>

      </div>
    </div>
  );
}
