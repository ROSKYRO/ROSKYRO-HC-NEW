/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",        // crisp deep slate ink
        "ink-muted": "#4B5563", // secondary text
        // IMPORTANT: a custom colour must be declared as a FULL scale, not a
        // bare string. `violet: "#4B21C4"` replaced Tailwind's entire built-in
        // violet palette, so every `text-violet-300` / `bg-violet-50` in the
        // app generated no CSS at all and those elements rendered uncoloured.
        // Same story for `emerald`, which only had 5 of its shades defined
        // while the app used emerald-200/300/400/800/900/950 in ~50 places.
        // DEFAULT keeps plain `bg-violet` / `text-emerald` working as before.
        violet: {
          DEFAULT: "#4B21C4",
          50: "#F3F0FC",
          100: "#E6DEFA",
          200: "#CDBDF5",
          300: "#B49CF0",
          400: "#9070E3",
          500: "#7C3AED",
          600: "#6229D6",
          700: "#4B21C4",
          800: "#371796",
          900: "#2A1173",
          950: "#1B0B4A",
        },
        "violet-dark": "#371796",
        "violet-light": "#7C3AED",
        magenta: "#D91C82",    // logo's pink/magenta
        flare: "#F5821F",      // logo's warm orange
        parchment: "#FAF9F6",  // clean warm off-white canvas
        mist: "#F3F0FC",       // soft radiant lavender
        clay: "#DC2626",       // urgent alert
        emerald: {
          DEFAULT: "#059669",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22",
        },
        // Used by OfficerDischarge's error panel (bg-rose-50 / border-rose-200
        // / text-rose-700) — kept explicit so it survives any future edit here.
        rose: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4B21C4 0%, #7C3AED 40%, #D91C82 75%, #F5821F 100%)',
        'brand-soft': 'linear-gradient(135deg, rgba(75, 33, 196, 0.08) 0%, rgba(217, 28, 130, 0.08) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(17, 24, 39, 0.06), 0 2px 6px -1px rgba(17, 24, 39, 0.04)',
        'card-hover': '0 20px 30px -8px rgba(75, 33, 196, 0.12), 0 8px 16px -4px rgba(17, 24, 39, 0.06)',
        'glow': '0 0 25px rgba(124, 58, 237, 0.25)',
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      // Tailwind's default spacing scale has no 4.5, so `w-4.5 h-4.5` and
      // `py-4.5` (used in OfficerDischarge / ForHospitals) produced nothing.
      spacing: {
        "4.5": "1.125rem",
      },
      // `animate-fadeIn` is used in Hero, ThreePillarsSection and the Navbar
      // mobile drawer but was never defined anywhere, so those panels just
      // appeared with no transition.
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out both",
      },
    },
  },
  plugins: [],
}
