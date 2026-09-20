"use client";

import { useCallback } from "react";

import { useTranslations } from "@/hooks/useTranslations";

/**
 * Returns a builder that produces a "required field" validation message for a
 * given field label. Falls back to a plain English string if the translation
 * key is missing so form validation always shows a useful message.
 */
export function useRequiredFieldMessage() {
  const t = useTranslations("common");

  return useCallback(
    (fieldLabel: string) => {
      try {
        // Preferred i18n key
        return t("requiredFieldMessage", { field: fieldLabel });
      } catch {
        return `${fieldLabel} is required`;
      }
    },
    [t],
  );
}
