
import { privacyPolicyAr } from "./privacy-policy.ar";
import { privacyPolicyEn, type PrivacyPolicyContent } from "./privacy-policy.en";

import type { Locale } from "@/config/i18n";

export type {
  PrivacyPolicyContent,
  PrivacySection,
  PrivacyShareRow,
} from "./privacy-policy.en";

export function getPrivacyPolicy(locale: Locale): PrivacyPolicyContent {
  return locale === "ar" ? privacyPolicyAr : privacyPolicyEn;
}

/** @deprecated Prefer getPrivacyPolicy(locale) */
export const privacyPolicy = privacyPolicyEn;
