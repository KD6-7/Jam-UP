import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette taken from the Jam Up brochure/logo
        cream: {
          DEFAULT: "#FBF0DA",
          light: "#FDF6E9",
        },
        maroon: {
          DEFAULT: "#7A1E0C",
          dark: "#5C1507",
        },
        jamred: "#E4340C",
        marigold: "#F59300",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "rise-in": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "settle-in": {
          from: { opacity: "0", transform: "translateY(-10px) rotate(0deg)" },
          to: { opacity: "1", transform: "translateY(0) rotate(var(--settle-tilt, 3deg))" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "settle-in": "settle-in 0.7s cubic-bezier(0.34,1.4,0.64,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
