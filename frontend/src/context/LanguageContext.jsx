import { createContext, useContext, useState, useEffect } from "react";

export const translations = {
  en: {
    // Top Bar & Nav
    top_location: "Ambikapur, Chhattisgarh Pilot Live",
    top_helpline: "24/7 Helpline",
    nav_for_patients: "For Patients & Families",
    nav_for_hospitals: "For Hospitals",
    nav_partner: "Join ROSKYRO",
    nav_whatsapp: "WhatsApp",
    nav_login: "Login",
    nav_logout: "Log out",
    nav_my_membership: "My Membership",
    nav_admin: "Admin Console",
    nav_pilot_badge: "Ambikapur Pilot Live",

    // Mobile Drawer
    mob_navigation: "Navigation",
    mob_emergency_support: "Emergency Support",
    mob_book_whatsapp: "Chat on WhatsApp",

    // Bottom Nav
    bottom_home: "Home",
    bottom_hospitals: "For Hospitals",
    bottom_patients: "For Patients",
    bottom_join: "Join ROSKYRO",
    bottom_vip: "VIP Pass",
    bottom_login: "Login",

    // Hero Section
    hero_badge: "Chhattisgarh & India's Premier Healthcare Concierge",
    hero_title_prefix: "Hospital visit or bedside care — ",
    hero_title_highlight: "a trusted companion",
    hero_title_suffix: " by your side.",
    hero_subtitle: "When you can't be there in person, ROSKYRO provides background-verified care companions to accompany your loved ones during hospital visits, OPD consultations, tests, and recovery in Ambikapur.",
    hero_concierge_btn: "Explore VIP Concierge",
    hero_verified_badge: "100% Police Verified",

    // General
    lang_name: "English",
    lang_switch: "हिन्दी में बदलें",
    switch_to: "हिंदी",
  },
  hi: {
    // Top Bar & Nav
    top_location: "अंबिकापुर, छत्तीसगढ़ पायलट लाइव",
    top_helpline: "24/7 हेल्पलाइन",
    nav_for_patients: "मरीज़ों और परिवार के लिए",
    nav_for_hospitals: "अस्पतालों के लिए",
    nav_partner: "ROSKYRO जॉइन करें",
    nav_whatsapp: "व्हाट्सएप",
    nav_login: "लॉगिन",
    nav_logout: "लॉगआउट",
    nav_my_membership: "मेरी सदस्यता",
    nav_admin: "एडमिन कंसोल",
    nav_pilot_badge: "अंबिकापुर पायलट लाइव",

    // Mobile Drawer
    mob_navigation: "नेविगेशन",
    mob_emergency_support: "आपातकालीन सहायता",
    mob_book_whatsapp: "व्हाट्सएप पर बात करें",

    // Bottom Nav
    bottom_home: "होम",
    bottom_hospitals: "अस्पताल",
    bottom_patients: "मरीज़ व परिवार",
    bottom_join: "ROSKYRO जॉइन",
    bottom_vip: "VIP पास",
    bottom_login: "लॉगिन",

    // Hero Section
    hero_badge: "छत्तीसगढ़ व भारत का अग्रणी हेल्थकेयर कॉन्सिएर्ज",
    hero_title_prefix: "अस्पताल का काम हो या अपनों की देखभाल — ",
    hero_title_highlight: "एक भरोसेमंद साथी",
    hero_title_suffix: " हमेशा आपके साथ।",
    hero_subtitle: "जब आप खुद मौजूद न हो सकें, ROSKYRO का बैकग्राउंड-सत्यापित केयर साथी आपके माता-पिता या मरीज के साथ ओपीडी पर्ची, डॉक्टर परामर्श, टेस्ट और डिस्चार्ज में हर कदम साथ रहता है।",
    hero_concierge_btn: "VIP कॉन्सिएर्ज देखें",
    hero_verified_badge: "100% पुलिस व आईडी सत्यापित",

    // General
    lang_name: "हिन्दी",
    lang_switch: "Switch to English",
    switch_to: "English",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("roskyro_lang") || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (lang) => {
    const nextLang = lang === "hi" ? "hi" : "en";
    setLanguageState(nextLang);
    try {
      localStorage.setItem("roskyro_lang", nextLang);
      document.documentElement.lang = nextLang;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, fallback = "") => {
    const dict = translations[language] || translations.en;
    if (dict[key] !== undefined) return dict[key];
    if (translations.en[key] !== undefined) return translations.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if accessed outside provider
    return {
      language: "en",
      setLanguage: () => {},
      t: (k, fallback = "") => translations.en[k] || fallback || k,
    };
  }
  return context;
}
