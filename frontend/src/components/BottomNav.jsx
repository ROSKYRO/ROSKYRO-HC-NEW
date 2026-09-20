import { Link, useLocation } from "react-router-dom";
import { Home, Building2, HeartHandshake, UserPlus, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isHome = location.pathname === "/";
  const isHospitals = location.pathname === "/for-hospitals";
  const isPatients = location.pathname === "/for-patients" || location.pathname.startsWith("/membership");
  const isPartner = location.pathname === "/become-a-partner" || location.pathname === "/join";
  const isAccount = location.pathname === "/member" || location.pathname === "/login";

  const items = [
    { to: "/", label: t("bottom_home"), icon: Home, active: isHome },
    { to: "/for-hospitals", label: t("bottom_hospitals"), icon: Building2, active: isHospitals },
    { to: "/for-patients", label: t("bottom_patients"), icon: HeartHandshake, active: isPatients },
    { to: "/become-a-partner", label: t("bottom_join"), icon: UserPlus, active: isPartner },
    {
      to: user ? "/member" : "/login",
      label: user ? "Account" : t("bottom_login"),
      icon: User,
      active: isAccount,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-ink/10 px-3 py-1.5 shadow-lg shadow-ink/10"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map(({ to, label, icon: Icon, active }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              active ? "text-violet font-bold" : "text-ink/60 hover:text-ink"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${active ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
