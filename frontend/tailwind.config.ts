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
      },
    },
  },
  plugins: [],
};

export default config;
