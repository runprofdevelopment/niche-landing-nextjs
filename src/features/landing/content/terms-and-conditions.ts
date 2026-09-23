import { termsAndConditionsAr } from "./terms-and-conditions.ar";
import {
  termsAndConditionsEn,
  type TermsAndConditionsContent,
} from "./terms-and-conditions.en";

import type { Locale } from "@/config/i18n";

export type { TermsAndConditionsContent, TermsSection } from "./terms-and-conditions.en";

export function getTermsAndConditions(locale: Locale): TermsAndConditionsContent {
  return locale === "ar" ? termsAndConditionsAr : termsAndConditionsEn;
}

/** @deprecated Prefer getTermsAndConditions(locale) */
export const termsAndConditions = termsAndConditionsEn;
