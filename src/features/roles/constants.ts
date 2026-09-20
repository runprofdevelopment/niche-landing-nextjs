import { ROLE_PERMISSIONS } from "@/constants/permissions";

import type { RoleStatus } from "./types";
import type { TranslationKey } from "@/providers/i18n";
import type { badgeVariants } from "@/shared/components";
import type { VariantProps } from "class-variance-authority";

export { ROLE_PERMISSIONS };

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
type RolesKey = TranslationKey<"roles">;

export const ROLE_STATUS_BADGE_VARIANT: Record<RoleStatus, BadgeVariant> = {
  active: "success",
  inactive: "inactive",
};

export const ROLE_STATUS_LABEL_KEYS: Record<RoleStatus, RolesKey> = {
  active: "statusActive",
  inactive: "statusInactive",
};

export const ROLE_STATUS_OPTIONS: RoleStatus[] = ["active", "inactive"];
