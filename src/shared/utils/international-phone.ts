import {
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

export type InternationalPhoneValue = {
  countryCode: string;
  phone: string;
};

export type PhoneValidationReason = "required" | "country_mismatch" | "invalid_length" | "invalid";

export type PhoneValidationResult =
  { valid: true } | { valid: false; reason: PhoneValidationReason };

export const DEFAULT_PHONE_COUNTRY_CODE = "SA";

export function getDialCode(countryCode: string): string {
  try {
    return `+${getCountryCallingCode(countryCode as CountryCode)}`;
  } catch {
    return "+966";
  }
}

export function toApiDialCode(code: string): string {
  if (code.startsWith("+")) return code;
  return getDialCode(fromApiDialCode(code));
}

/** Map a bare dial code (`+20`, `20`) to an ISO country for the flag dropdown. */
function isoFromCallingCode(callingCode: string): string | null {
  const digits = callingCode.replace(/\D/g, "");
  if (!digits) return null;

  const matches = getCountries().filter((code) => getCountryCallingCode(code) === digits);
  if (matches.length === 0) return null;
  if (matches.includes(DEFAULT_PHONE_COUNTRY_CODE as CountryCode)) {
    return DEFAULT_PHONE_COUNTRY_CODE;
  }
  return matches[0] ?? null;
}

/**
 * Normalize API country values to ISO 3166-1 alpha-2 for the phone UI.
 * Accepts `SA`, `+966`, or `966`. Bare dial codes (e.g. `+20`) map to EG, not SA.
 */
export function fromApiDialCode(code: string, fallback = DEFAULT_PHONE_COUNTRY_CODE): string {
  if (!code) return fallback;
  const trimmed = code.trim();
  if (!trimmed) return fallback;

  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();

  const asPlus = trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`;

  // Full / partial E.164 (e.g. +2010…)
  const parsed = parsePhoneNumberFromString(asPlus);
  if (parsed?.country) return parsed.country;

  // Dial code only (e.g. +20) — parsePhoneNumberFromString often returns no country.
  const fromDial = isoFromCallingCode(asPlus);
  if (fromDial) return fromDial;

  return fallback;
}

/**
 * Hydrate the phone form for edit: ISO country + national digits.
 * When API sends `countryCode` separately (guest list), that field wins for the dropdown.
 */
export function resolvePhoneFormValue(
  phone?: string | null,
  apiCountryCode?: string | null,
): InternationalPhoneValue {
  const rawPhone = phone?.trim() ?? "";
  const rawCountry = apiCountryCode?.trim() ?? "";

  if (!rawPhone && !rawCountry) {
    return { countryCode: DEFAULT_PHONE_COUNTRY_CODE, phone: "" };
  }

  // Guest list already provides countryCode separately — always prefer it.
  if (rawCountry) {
    const countryCode = fromApiDialCode(rawCountry);
    const dialDigits = getDialCode(countryCode).replace(/\D/g, "");

    let national = rawPhone;
    if (rawPhone.startsWith("+")) {
      const detected = detectCountryFromInput(rawPhone);
      national = detected?.phone ?? rawPhone.replace(/\D/g, "");
    } else {
      national = rawPhone.replace(/\D/g, "");
    }

    // Strip dial digits if they were left on the national number.
    if (dialDigits && national.startsWith(dialDigits)) {
      national = national.slice(dialDigits.length);
    }

    return { countryCode, phone: national };
  }

  if (rawPhone.startsWith("+")) {
    const detected = detectCountryFromInput(rawPhone);
    if (detected) return detected;
  }

  const detected = detectCountryFromInput(rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`);
  if (detected) return detected;

  return {
    countryCode: DEFAULT_PHONE_COUNTRY_CODE,
    phone: rawPhone.replace(/\D/g, ""),
  };
}

/** Typical national length for the country (mobile example), used to clamp input. */
export function getNationalPhoneMaxLength(countryCode: string): number {
  try {
    const example = getExampleNumber(countryCode.toUpperCase() as CountryCode, examples);
    const exampleLength = example?.nationalNumber.length ?? 0;
    // Allow a little headroom for local formats, but stay within E.164 national limits.
    return Math.min(15, Math.max(exampleLength + 2, 10));
  } catch {
    return 15;
  }
}

/**
 * Validates national phone digits against the selected ISO country:
 * - non-empty
 * - matches that country (not another region's number)
 * - correct length / possible for the country
 * - fully valid number for the country
 */
export function validateInternationalPhone(
  countryCode: string,
  phone: string,
): PhoneValidationResult {
  const digits = phone.replace(/\D/g, "").trim();
  if (!digits) return { valid: false, reason: "required" };

  const iso = countryCode.toUpperCase();
  try {
    const parsed = parsePhoneNumberFromString(digits, iso as CountryCode);
    if (!parsed) return { valid: false, reason: "invalid" };

    if (parsed.country && parsed.country !== iso) {
      return { valid: false, reason: "country_mismatch" };
    }

    if (!parsed.isPossible()) {
      return { valid: false, reason: "invalid_length" };
    }

    if (!parsed.isValid()) {
      return { valid: false, reason: "invalid" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "invalid" };
  }
}

export function isValidInternationalPhone(countryCode: string, phone: string): boolean {
  return validateInternationalPhone(countryCode, phone).valid;
}

export function clampNationalPhoneInput(raw: string, countryCode: string): string {
  const maxLength = getNationalPhoneMaxLength(countryCode);
  return raw.replace(/\D/g, "").slice(0, maxLength);
}

export function detectCountryFromInput(raw: string): { countryCode: string; phone: string } | null {
  if (!raw.startsWith("+")) return null;
  const parsed = parsePhoneNumberFromString(raw);
  if (!parsed?.country) return null;
  return {
    countryCode: parsed.country,
    phone: parsed.nationalNumber,
  };
}

export function formatInternationalPhone(countryCode: string, phone: string): string {
  try {
    const parsed = parsePhoneNumberFromString(phone, countryCode as CountryCode);
    return parsed?.formatInternational() ?? `${getDialCode(countryCode)} ${phone}`;
  } catch {
    return `${getDialCode(countryCode)} ${phone}`;
  }
}

/**
 * Normalizes a phone number to E.164.
 * When `countryCode` is omitted, `phone` may already include a country dial code.
 */
export function toE164Phone(countryCode: string | undefined, phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;

  try {
    const parsed = countryCode
      ? parsePhoneNumberFromString(trimmed, countryCode as CountryCode)
      : parsePhoneNumberFromString(trimmed);

    if (parsed?.isValid()) return parsed.format("E.164");
  } catch {
    return null;
  }

  return null;
}

export function getCountryFlagUrl(code: string): string {
  return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
}

export function getPhoneCountryOptions(locale: string) {
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });

  return getCountries()
    .map((code) => ({
      value: code,
      label: displayNames.of(code) ?? code,
      dialCode: getDialCode(code),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}
