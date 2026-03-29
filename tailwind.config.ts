import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          DEFAULT: "#A07855",
          dark: "#8A6648",
          muted: "#C4A484",
        },
        cream: "#FAF7F2",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif-sc)", "Songti SC", "STSong", "serif"],
        sans: ["var(--font-noto-sans-sc)", "PingFang SC", "Heiti SC", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
