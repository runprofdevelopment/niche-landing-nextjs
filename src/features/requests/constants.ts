import type { ContactUsStatus } from "./types";

export const CONTACT_US_STATUS_BADGE_VARIANT = {
  pending: "warning",
  resolved: "success",
} as const satisfies Record<ContactUsStatus, "warning" | "success">;

export const CONTACT_US_STATUS_LABEL_KEYS = {
  pending: "statusPending",
  resolved: "statusResolved",
} as const satisfies Record<ContactUsStatus, "statusPending" | "statusResolved">;
