import { Link } from "react-router-dom";
import { 
  Building2, 
  HeartHandshake, 
  UserPlus, 
  MessageSquare, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Globe 
} from "lucide-react";
import { 
  BOOK_WA_LINK, 
  SUPPORT_PHONE_DISPLAY, 
  SUPPORT_EMAIL, 
  INSTAGRAM_HANDLE, 
  INSTAGRAM_URL, 
  PILOT_CITY, 
  PILOT_STATE 
} from "../config";

export default function Footer() {
  return (
    <footer className="bg-ink text-parchment/80 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16">
        
        {/* Top Grid: Brand + 3 Pillars + Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Pilot Status */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group inline-flex">
              <img 
                src="/brand/logo-sm.png" 
                alt="ROSKYRO — Healthcare Concierge" 
                className="w-9 h-9 object-contain" 
              />
              <div>
                <span className="font-display text-xl font-bold text-parchment group-hover:text-flare transition-colors">
                  ROSKYRO
                </span>
                <span className="block text-[10px] font-sans font-semibold tracking-wider text-parchment/50 uppercase">
                  Healthcare Concierge
                </span>
              </div>
            </Link>
            
            <p className="text-sm leading-relaxed text-parchment/65 max-w-sm mb-6">
              India's Healthcare Concierge platform connecting hospitals, patients &amp; families, and verified Relationship Officers for seamless, dignified bedside care and navigation.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{PILOT_CITY}, {PILOT_STATE} Pilot Live</span>
            </div>
          </div>

          {/* Col 2: Pillar 1 — For Hospitals */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-flare mb-4">
              <Building2 className="w-3.5 h-3.5" />
              <span>For Hospitals</span>
            </div>
            <ul className="space-y-2.5 text-sm text-parchment/70">
              <li>
                <Link to="/for-hospitals" className="hover:text-parchment hover:underline transition-colors">
                  Patient Concierge Program
                </Link>
              </li>
              <li>
                <Link to="/for-hospitals#benefits" className="hover:text-parchment hover:underline transition-colors">
                  0 Payroll Burden Model
                </Link>
              </li>
              <li>
                <Link to="/hospital/login" className="hover:text-parchment hover:underline transition-colors flex items-center gap-1">
                  <span>Hospital Staff Console</span>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-parchment/80">Login</span>
                </Link>
              </li>
              <li>
                <a 
                  href={`mailto:${SUPPORT_EMAIL}?subject=Hospital%20Partnership%20Enquiry`}
                  className="hover:text-parchment hover:underline transition-colors"
                >
                  Partner With ROSKYRO
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Pillar 2 — For Patients & Families */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-flare mb-4">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>For Patients</span>
            </div>
            <ul className="space-y-2.5 text-sm text-parchment/70">
              <li>
                <Link to="/for-patients" className="hover:text-parchment hover:underline transition-colors">
                  Concierge Support &amp; Journey
                </Link>
              </li>
              <li>
                <Link to="/membership/info" className="hover:text-parchment hover:underline transition-colors">
                  VIP Annual Memberships
                </Link>
              </li>
              <li>
                <Link to="/membership/priority-access" className="hover:text-parchment hover:underline transition-colors">
                  Priority Doctor Access
                </Link>
              </li>
              <li>
                <a 
                  href={BOOK_WA_LINK} 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-parchment hover:underline transition-colors flex items-center gap-1 text-emerald-400"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Book on WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Pillar 3 — Join ROSKYRO */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-flare mb-4">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join ROSKYRO</span>
            </div>
            <ul className="space-y-2.5 text-sm text-parchment/70">
              <li>
                <Link to="/become-a-partner" className="hover:text-parchment hover:underline transition-colors">
                  Relationship Officer Careers
                </Link>
              </li>
              <li>
                <Link to="/become-a-partner#benefits" className="hover:text-parchment hover:underline transition-colors">
                  Weekly Pay &amp; Insurance
                </Link>
              </li>
              <li>
                <Link to="/become-a-partner" className="hover:text-parchment hover:underline transition-colors">
                  Apply Online (1-min)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-parchment hover:underline transition-colors">
                  Officer / Member Portal
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Middle Bar: Contact & Help */}
        <div className="py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-parchment/60 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-5">
            <a href={BOOK_WA_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-parchment hover:text-white transition-colors">
              <MessageSquare className="w-3.5 h-3.5 text-flare" />
              <span>24x7 WhatsApp Helpline: <strong className="text-white">{SUPPORT_PHONE_DISPLAY}</strong></span>
            </a>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-parchment/50" />
              <span>{SUPPORT_EMAIL}</span>
            </span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-parchment/50" />
              <span>{PILOT_CITY}, {PILOT_STATE}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={INSTAGRAM_URL} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>@{INSTAGRAM_HANDLE}</span>
            </a>
            <span className="text-white/20">|</span>
            <Link to="/feedback" className="hover:text-white transition-colors">
              Feedback &amp; Complaints
            </Link>
          </div>
        </div>

        {/* Bottom Disclaimer & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-parchment/40">
          <div>
            © {new Date().getFullYear()} ROSKYRO. All Rights Reserved. Not a substitute for 102/108 ambulance medical emergency care.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-parchment/70 transition-colors">
              Terms of Service
            </Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-parchment/70 transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/feedback" className="hover:text-parchment/70 transition-colors">
              Grievances
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
