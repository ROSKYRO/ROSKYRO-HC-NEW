import TermsSection from "../components/sections/TermsSection";
import useSEO from "../hooks/useSEO";
import { BRAND } from "../config";

export default function TermsPage() {
  useSEO({
    path: "/terms",
    title: `${BRAND} — Terms of Service`,
    description: "Read the ROSKYRO Healthcare Concierge Terms of Service.",
  });

  return (
    <div className="py-10">
      <TermsSection />
    </div>
  );
}
