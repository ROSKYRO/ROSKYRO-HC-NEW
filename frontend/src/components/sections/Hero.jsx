import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  HeartHandshake, 
  UserPlus, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Crown, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { BOOK_WA_LINK, SUPPORT_PHONE_DISPLAY, PILOT_CITY, PILOT_STATE } from "../../config";
import { useLanguage } from "../../context/LanguageContext";

export default function Hero() {
  const { language, t } = useLanguage();
  const [activeHeroCard, setActiveHeroCard] = useState(1); // 0: Hospitals, 1: Patients, 2: Officers

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-mist/50 to-slate-50 pt-10 sm:pt-14 pb-14 sm:pb-20">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-violet/5 via-magenta/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top 3-Pillars Quick Jump Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted hidden md:inline mr-1">
            Choose Your Category:
          </span>
          <Link
            to="/for-hospitals"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>For Hospitals</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </Link>
          <Link
            to="/for-patients"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-violet/30 text-violet hover:bg-violet/5 text-xs font-bold transition-all shadow-xs"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>For Patients &amp; Families</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </Link>
          <Link
            to="/become-a-partner"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-all shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Join ROSKYRO</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Live Pilot Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-6 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>{PILOT_CITY}, {PILOT_STATE} — Official Pilot Active</span>
            </div>

            {/* Main Headline */}
            {language === "hi" ? (
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-ink tracking-tight mb-5">
                अस्पताल का काम हो या परिजनों की देखभाल, <br className="hidden sm:block" />
                <span className="bg-brand-gradient bg-clip-text text-transparent">
                  तीन मजबूत स्तंभों पर आधारित हेल्थकेयर।
                </span>
              </h1>
            ) : (
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] text-ink tracking-tight mb-5">
                India's Healthcare Concierge, <br className="hidden sm:block" />
                <span className="bg-brand-gradient bg-clip-text text-transparent">
                  Built on Three Core Pillars.
                </span>
              </h1>
            )}

            {/* Subtitle */}
            <p className="text-ink-muted text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              ROSKYRO connects <strong>Hospitals</strong> for 0-burden non-clinical care, provides <strong>Patients &amp; Families</strong> with bedside relationship officers &amp; VIP passes, and offers <strong>Care Professionals</strong> dignified, well-paying careers.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-8">
              <a
                href="#three-pillars"
                className="px-7 py-3.5 rounded-full bg-brand-gradient text-white font-semibold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-violet/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Explore the 3 Pillars</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={BOOK_WA_LINK}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-full border border-ink/15 bg-white text-ink font-semibold text-sm sm:text-base flex items-center gap-2 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Helpline</span>
              </a>

              <a
                href={BOOK_WA_LINK}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3.5 rounded-full text-ink-muted hover:text-clay text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                title="WhatsApp 24x7 Helpline"
              >
                <MessageSquare className="w-4 h-4 text-clay" />
                <span>24x7 WhatsApp: {SUPPORT_PHONE_DISPLAY}</span>
              </a>
            </div>

            {/* Trust Metric Strip */}
            <div className="pt-6 border-t border-ink/10 grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-ink leading-tight">100% Verified</div>
                  <div className="text-[11px] text-ink-muted">Aadhaar + Police Checked</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-100 text-magenta flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-magenta" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-ink leading-tight">4.9 / 5.0 Rating</div>
                  <div className="text-[11px] text-ink-muted">1,200+ Assisted Patients</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3-Pillar Spotlight Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md w-full">
              
              {/* Tab Selector on top of card */}
              <div className="flex items-center justify-between bg-slate-200/80 p-1.5 rounded-2xl mb-3 text-xs font-bold">
                <button
                  onClick={() => setActiveHeroCard(0)}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    activeHeroCard === 0 ? "bg-white text-indigo-700 shadow-xs" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  For Hospitals
                </button>
                <button
                  onClick={() => setActiveHeroCard(1)}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    activeHeroCard === 1 ? "bg-white text-violet shadow-xs" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  For Patients
                </button>
                <button
                  onClick={() => setActiveHeroCard(2)}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    activeHeroCard === 2 ? "bg-white text-emerald-700 shadow-xs" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  Join ROSKYRO
                </button>
              </div>

              {/* Dynamic Card Container */}
              <div className="p-[1.5px] rounded-3xl bg-gradient-to-b from-violet via-magenta/40 to-slate-300 shadow-xl">
                <div className="bg-white rounded-[23px] overflow-hidden p-6">
                  
                  {activeHeroCard === 0 && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Pillar 01 · Healthcare Providers
                        </span>
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-ink mb-1">
                        Patient Concierge Program
                      </h3>
                      <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                        Dedicated Relationship Officers for admitted beds. Relieve nursing desks of routine coordination.
                      </p>
                      <div className="space-y-2 text-xs text-ink/80 mb-5 bg-slate-50 p-3.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>0 payroll burden &amp; 0 HR liability</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Faster discharge &amp; billing clearance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Real-time Hospital Staff Console</span>
                        </div>
                      </div>
                      <Link
                        to="/for-hospitals"
                        className="block w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Explore Hospital Partnership →
                      </Link>
                    </div>
                  )}

                  {activeHeroCard === 1 && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet/10 text-violet border border-violet/20">
                          Pillar 02 · Patients &amp; Families
                        </span>
                        <HeartHandshake className="w-5 h-5 text-violet" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-ink mb-1">
                        Bedside Care &amp; VIP Passes
                      </h3>
                      <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                        A personal officer at your bedside for hospital visits, admission paperwork, and family peace of mind.
                      </p>
                      <div className="space-y-2 text-xs text-ink/80 mb-5 bg-violet/5 p-3.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet shrink-0" />
                          <span>Assigned within 30 min of admission</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet shrink-0" />
                          <span>VIP Care memberships from ₹24,999/yr</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet shrink-0" />
                          <span>Daily photo &amp; milestone family updates</span>
                        </div>
                      </div>
                      <Link
                        to="/for-patients"
                        className="block w-full text-center py-2.5 rounded-xl bg-brand-gradient text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-sm"
                      >
                        Explore Patient Care &amp; Passes →
                      </Link>
                    </div>
                  )}

                  {activeHeroCard === 2 && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Pillar 03 · Join ROSKYRO
                        </span>
                        <UserPlus className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-ink mb-1">
                        Earn with Dignity as an Officer
                      </h3>
                      <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                        Join our certified healthcare concierge workforce with weekly pay, benefits, and respected uniforms.
                      </p>
                      <div className="space-y-2 text-xs text-ink/80 mb-5 bg-emerald-50/50 p-3.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Direct weekly UPI bank payouts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Day-one accident &amp; health insurance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Certified 5-day professional training</span>
                        </div>
                      </div>
                      <Link
                        to="/become-a-partner"
                        className="block w-full text-center py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Apply to Join ROSKYRO →
                      </Link>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-ink/5 flex items-center justify-between text-[11px] text-ink-muted">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Official Platform
                    </span>
                    <a href="#faq" className="text-violet hover:underline font-medium">
                      FAQs &amp; Help
                    </a>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
