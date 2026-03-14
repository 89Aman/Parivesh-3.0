import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#166534",       /* Deep forest green */
        "primary-light": "#15803d",
        accent: "#10b981",        /* Emerald success/active */
        "background-light": "#f0fdf4",
        "background-dark": "#0f1f0f",
        "sidebar-dark": "#0f1f0f",
        "text-primary": "#111827",
        "text-secondary": "#6b7280",
        "card-white": "#ffffff",
        /* Legacy aliases for compatibility */
        "primary-dark": "#14532d",
        "secondary": "#10b981",
        "accent-green": "#10b981",
        "accent-blue": "#0ea5e9",
        "earth": "#78350f",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "Public Sans", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "Public Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        full: "9999px",
      },
      boxShadow: {
        "glass": "0 4px 24px -1px rgba(22, 101, 52, 0.08), 0 2px 8px -2px rgba(22, 101, 52, 0.04)",
        "glass-hover": "0 12px 40px -4px rgba(22, 101, 52, 0.12), 0 4px 16px -4px rgba(22, 101, 52, 0.06)",
        "glow": "0 0 20px -4px rgba(16, 185, 129, 0.35), 0 0 40px -8px rgba(22, 101, 52, 0.2)",
        "glow-sm": "0 0 12px -2px rgba(16, 185, 129, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.3)" },
          "50%": { opacity: "0.95", boxShadow: "0 0 0 6px rgba(16, 185, 129, 0.1)" },
        },
      },
      transitionDuration: {
        "200": "200ms",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [forms, containerQueries],
};
