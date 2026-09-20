import { STAFF_PERMISSIONS } from "@/constants/permissions";

import type { StaffReviewStatus } from "./services/graphql-types";
import type { StaffState, StaffStatus } from "./types";
import type { TranslationKey } from "@/providers/i18n";
import type { badgeVariants } from "@/shared/components";
import type { VariantProps } from "class-variance-authority";

export { STAFF_PERMISSIONS };

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
type StaffKey = TranslationKey<"staff">;

export const STAFF_STATUS_BADGE_VARIANT: Record<StaffStatus, BadgeVariant> = {
  active: "success",
  inactive: "inactive",
};

export const STAFF_STATUS_LABEL_KEYS: Record<StaffStatus, StaffKey> = {
  active: "statusActive",
  inactive: "statusInactive",
};

export const STAFF_STATUS_OPTIONS: StaffStatus[] = ["active", "inactive"];

export const STAFF_REVIEW_STATUS_BADGE_VARIANT: Record<StaffReviewStatus, BadgeVariant> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
};

export const STAFF_REVIEW_STATUS_LABEL_KEYS: Record<StaffReviewStatus, StaffKey> = {
  PENDING: "reviewStatusPending",
  ACCEPTED: "reviewStatusApproved",
  REJECTED: "reviewStatusRejected",
};

/** Backend `StaffDepartment` enum value → translation key. */
export const STAFF_DEPARTMENT_LABEL_KEYS: Record<string, StaffKey> = {
  ADMINISTRATION: "departmentAdministration",
  CUSTOMER_SUPPORT: "departmentCustomerSupport",
  FINANCE: "departmentFinance",
  HR: "departmentHr",
  IT: "departmentIt",
  LEGAL: "departmentLegal",
  MARKETING: "departmentMarketing",
  OPERATIONS: "departmentOperations",
  SALES: "departmentSales",
};

export type StaffTab = StaffState;

export const STAFF_TABS: { value: StaffTab; labelKey: StaffKey }[] = [
  { value: "active", labelKey: "tabActive" },
  { value: "pending", labelKey: "tabPending" },
];

/** Maps GraphQL mutation operation names to permission keys. */
export const STAFF_MUTATION_PERMISSIONS = {
  CreateStaff: STAFF_PERMISSIONS.create,
} as const;
