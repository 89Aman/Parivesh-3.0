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
              "primary": "#5600b2",
              "accent-green": "#22c55e",
              "accent-blue": "#3b82f6",
              "background-light": "#f7f5f8",
              "background-dark": "#190f23",
          },
          fontFamily: {
              "display": ["Public Sans", "sans-serif"]
          },
          borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
      },
  },
  plugins: [
     forms,
     containerQueries,
  ],
}
