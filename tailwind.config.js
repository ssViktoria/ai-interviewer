/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#60A5FA",
        },
        background: {
          dark: "#0F172A",
          card: "#1E293B",
          elevated: "#334155",
        },
        accent: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          purple: "#8B5CF6",
        },
      },
    },
  },
  plugins: [],
};