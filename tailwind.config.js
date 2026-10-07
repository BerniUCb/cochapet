import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"] },
      colors: {
        primary: { DEFAULT: "#CC4900", hover: "#A33900", soft: "#FFE9DC", foreground: "#FFFFFF" },
        success: { DEFAULT: "#10B981", strong: "#047857", soft: "#D1FAE5" },
        bg: "#F9F9FF",
        surface: { DEFAULT: "#FFFFFF", alt: "#F0F3FF" },
        ink: { DEFAULT: "#111C2D", muted: "#4B5568", subtle: "#6B7486" },
        line: "#E1E6F2",
        error: { DEFAULT: "#BA1A1A", soft: "#FFDAD6" },
      },
      boxShadow: { soft: "0 1px 2px rgba(17,28,45,.06), 0 4px 16px rgba(17,28,45,.06)", lift: "0 8px 28px rgba(17,28,45,.12)" },
      keyframes: { "fade-up": { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } } },
      animation: { "fade-up": "fade-up .25s ease-out" },
    },
  },
  plugins: [animate],
};
