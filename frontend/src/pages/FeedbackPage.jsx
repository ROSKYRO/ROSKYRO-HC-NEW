import ComplaintSection from "../components/sections/ComplaintSection";
import useSEO from "../hooks/useSEO";
import { BRAND } from "../config";

export default function FeedbackPage() {
  useSEO({
    path: "/feedback",
    title: `${BRAND} — Feedback & Complaints`,
    description: "Submit feedback or complaints to the ROSKYRO Healthcare Concierge team.",
  });

  return (
    <div className="py-10">
      <ComplaintSection />
    </div>
  );
}
