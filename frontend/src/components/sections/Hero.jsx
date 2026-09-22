import { Link } from "react-router-dom";
import { 
  Building2, 
  HeartHandshake, 
  UserPlus, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  Lock,
  Search,
} from "lucide-react";
import { BOOK_WA_LINK, SUPPORT_PHONE_DISPLAY, PILOT_CITY, PILOT_STATE } from "../../config";

export default function Hero() {
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

        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-8 items-center">

          {/* Core Value Proposition */}
          <div className="max-w-3xl lg:max-w-none mx-auto lg:mx-0 text-center lg:text-left">
            
            {/* Live Pilot Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-6 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>{PILOT_CITY}, {PILOT_STATE} — Official Pilot Active</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.12] text-ink tracking-tight mb-5">
              India's Healthcare Concierge, <br className="hidden sm:block" />
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                Built on Three Core Pillars.
              </span>
            </h1>

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

          {/* Priority Access — Browser Window Preview Card */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">

            {/* Floating "New" badge */}
            <span className="absolute -top-3.5 left-6 z-10 bg-brand-gradient text-white text-[10.5px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-md">
              Membership Benefit
            </span>

            <Link
              to="/membership/priority-access"
              className="group block rounded-2xl border border-ink/10 bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all overflow-hidden"
            >
              {/* Browser chrome bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 border-b border-ink/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex items-center gap-1.5 bg-white rounded-full border border-ink/10 px-3 py-1 text-[11px] text-ink-muted truncate">
                  <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">roskyro.in/membership/priority-access</span>
                </div>
              </div>

              {/* Window content — mini Priority Access preview */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-mist/60 to-white">
                <span className="text-[11px] font-bold tracking-wide text-magenta block mb-1.5">
                  PRIORITY ACCESS NETWORK
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-ink font-bold mb-2 leading-snug">
                  Find a Priority Access partner.
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted mb-4 leading-relaxed">
                  Verified doctors &amp; hospitals offering priority appointments — search by city and specialty.
                </p>

                {/* Decorative mini search form */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs text-ink-muted/70">
                    City (e.g. Jabalpur)
                  </div>
                  <div className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs text-ink-muted/70">
                    Specialty / dept.
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs text-ink-muted/70">
                    Doctor or Hospital
                  </div>
                  <div className="shrink-0 rounded-full bg-brand-gradient text-white text-xs font-semibold px-4 py-2 flex items-center gap-1.5 shadow-sm group-hover:shadow-glow transition-shadow">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-ink/10">
                  <span className="text-[11px] text-ink-muted flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Booking needs Concierge membership
                  </span>
                  <span className="text-xs font-semibold text-violet flex items-center gap-1 shrink-0 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
