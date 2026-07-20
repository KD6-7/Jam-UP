import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
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
        // Fruit accents for flavor gradients (from the flavors themselves)
        mango: "#FFB020",
        guava: "#F2617A",
        fig: "#6C3FA0",
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
        "gradient-drift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--float-tilt, 0deg))" },
          "50%": { transform: "translateY(-14px) rotate(var(--float-tilt, 0deg))" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "settle-in": "settle-in 0.7s cubic-bezier(0.34,1.4,0.64,1) both",
        "gradient-drift": "gradient-drift 14s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
