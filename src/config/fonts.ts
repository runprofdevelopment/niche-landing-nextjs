import { Arimo, Domine, Geist, Noto_Sans_Arabic } from "next/font/google";

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

export const fontGeist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const fontDisplay = Domine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-domine",
  display: "swap",
});

export const fontVariables = `${fontSans.variable} ${fontSansArabic.variable} ${fontGeist.variable} ${fontDisplay.variable}`;
