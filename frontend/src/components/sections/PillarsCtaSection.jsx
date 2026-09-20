import { Link } from "react-router-dom";
import { Building2, HeartHandshake, UserPlus, ArrowRight, MessageSquare } from "lucide-react";
import { BOOK_WA_LINK, JOIN_WA_LINK, SUPPORT_PHONE_DISPLAY, SUPPORT_EMAIL } from "../../config";

export default function PillarsCtaSection() {
  return (
    <section className="bg-ink text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-flare">Get Started Today</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-4">
            Connect with ROSKYRO Across Any Pillar
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            Whether you are a hospital administrator, a family member needing bedside care, or a professional seeking dignified work, we are ready to assist.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Hospitals */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-400/50 hover:bg-white/8 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Hospitals &amp; Groups</span>
              <h3 className="font-display text-xl font-bold text-white mt-1 mb-3">Partner Your Hospital</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
                Offload non-clinical coordination, improve patient NPS, and give every admitted patient a dedicated officer with zero payroll overhead.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/for-hospitals"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Explore Hospital Program</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Hospital%20Partnership%20Enquiry`}
                className="block text-center text-xs text-indigo-300 hover:underline"
              >
                Email: {SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          {/* Card 2: Patients & Families */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-violet/50 hover:bg-white/8 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet/20 text-violet-300 flex items-center justify-center mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">Patients &amp; Families</span>
              <h3 className="font-display text-xl font-bold text-white mt-1 mb-3">Request Concierge Care</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
                Get a dedicated Relationship Officer by your side for an upcoming admission, OPD visits, elderly parent assistance, or join VIP membership.
              </p>
            </div>
            <div className="space-y-3">
              <a
                href={BOOK_WA_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Book on WhatsApp</span>
              </a>
              <Link
                to="/for-patients"
                className="block text-center text-xs text-violet-300 hover:underline"
              >
                Explore Patient Plans &amp; Passes →
              </Link>
            </div>
          </div>

          {/* Card 3: Officers */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-400/50 hover:bg-white/8 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Healthcare Careers</span>
              <h3 className="font-display text-xl font-bold text-white mt-1 mb-3">Become an Officer</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
                Earn with dignity, receive certified healthcare training, get weekly UPI payouts, medical insurance, and build a rewarding career.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/become-a-partner"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-ink font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Apply Online (1-Minute)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={JOIN_WA_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-center text-xs text-emerald-300 hover:underline"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Recruitment Line (WhatsApp): {SUPPORT_PHONE_DISPLAY}
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
