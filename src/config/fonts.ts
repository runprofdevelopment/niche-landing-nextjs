import { Arimo, Domine, Noto_Sans_Arabic } from "next/font/google";

/** Arimo has no Arabic glyphs; Noto Sans Arabic covers those characters in the body stack. */
export const fontSans = Arimo({
  subsets: ["latin"],
  variable: "--font-arimo",
  display: "swap",
});

export const fontSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arimo-arabic",
  display: "swap",
});

export const fontDisplay = Domine({
  subsets: ["latin"],
  variable: "--font-domine",
  display: "swap",
});

export const fontVariables = `${fontSans.variable} ${fontSansArabic.variable} ${fontDisplay.variable}`;
