import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/screens/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(90deg, rgba(0,0,0,0.7455357142857143) 0%, rgba(255,255,255,0.1516981792717087) 100%)",
        "vertical-gradient":
          "linear-gradient(0deg, rgba(0,0,0,0.7455357142857143) 0%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.1516981792717087) 100%)",
        "white-vertical":
          "linear-gradient(180deg, rgba(255,255,255,1) 24%, rgba(255,255,255,0.1516981792717087) 100%); ",
      },
      fontFamily: {
        "island-moments": ["island-moments", "sans-serif"],
      },
      spacing: {
        "128": "32rem",
        "146": "36.5rem",
      },
    },
    colors: {
      //transparent
      blurEffect: "#0000007a",
      blurEffectWhite: "#ffffff85",
      blurEffectGold: "#e39d4096",
      transBlue: "#f4f4f5bd",

      //theme
      themeOrange: "#f16e21",
      themeWhite: "#ffffff",
      themeDark: "#060710",

      //text
      textPrimary: "#060710",
      textSecondary: "#96969F",
      textTertiary: "#D6D6E4",

      //input
      inputPrimary: "#060710",
      inputSecondary: "#A4A5AA",

      //decor
      backgroundDecor500: "#A4A5AA",
      backgroundDecor200: "#EAECF4",
      backgroundDecor100: "#F0F0F3",

      //card:
      anitiqueWhite: "#faebd7",

      //table
      tableBorder500: "#a4a5aa99",
      tableBorder400: "#a4a5aa75",

      //text/icon
      textIconBrand: "#F36523",

      //border
      borderSecondary: "#86868E",

      //surface
      surfaceBrand: "#F36523"
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
