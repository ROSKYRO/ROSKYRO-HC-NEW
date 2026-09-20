import PrivacySection from "../components/sections/PrivacySection";
import useSEO from "../hooks/useSEO";
import { BRAND } from "../config";

export default function PrivacyPage() {
  useSEO({
    path: "/privacy",
    title: `${BRAND} — Privacy Policy`,
    description: "Read how ROSKYRO Healthcare Concierge protects and manages your data.",
  });

  return (
    <div className="py-10">
      <PrivacySection />
    </div>
  );
}
