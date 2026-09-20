import LaunchBanner from "../components/sections/LaunchBanner";
import Hero from "../components/sections/Hero";
import ThreePillarsSection from "../components/sections/ThreePillarsSection";
import TrustSection from "../components/sections/TrustSection";
import FaqSection from "../components/sections/FaqSection";
import PillarsCtaSection from "../components/sections/PillarsCtaSection";
import useSEO, { SITE_URL } from "../hooks/useSEO";
import { SUPPORT_EMAIL, PILOT_CITY, PILOT_STATE } from "../config";

export default function Home() {
  useSEO({
    path: "/",
    title: "ROSKYRO — Healthcare Concierge | For Hospitals, Patients & Partners",
    description:
      "ROSKYRO is built on three core pillars: For Hospitals (Patient Concierge Program), For Patients & Families (Bedside Care & VIP Passes), and Join ROSKYRO (Dignified Healthcare Careers).",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ROSKYRO",
      alternateName: "ROSKYRO Healthcare Concierge",
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo-og.png`,
      email: SUPPORT_EMAIL,
      areaServed: `${PILOT_CITY}, ${PILOT_STATE}`,
      description:
        "ROSKYRO runs the Patient Concierge Program for hospitals — a dedicated Relationship Officer for every enrolled patient — and annual Concierge memberships for patients and families.",
    },
  });

  return (
    <div className="bg-parchment min-h-screen">
      {/* Pilot Launch Status */}
      <LaunchBanner />

      {/* Hero Section foregrounding the 3 Pillars */}
      <Hero />

      {/* The Central 3 Pillars Master Showcase & Interactive Deep Dives */}
      <ThreePillarsSection />

      {/* The Gold Standard of Trust & Officer Verification */}
      <TrustSection />

      {/* Structured 3-Pillar FAQs */}
      <FaqSection />

      {/* Call to Action Across the 3 Pillars */}
      <PillarsCtaSection />
    </div>
  );
}
