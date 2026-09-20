import { fromApiDialCode } from "@/shared/utils/international-phone";

import type { StaffTab } from "../../constants";
import type { StaffMemberRecord } from "../../services/types";
import type {
  StaffAssignedRole,
  StaffDetails,
  StaffFormInitialData,
  StaffStatus,
} from "../../types";
import type { StaffUserNode } from "../queries/user-list";
import type { UserAvatarInput } from "@/shared/graphql/mutations/user-update";

function toUiStatus(status: string | null | undefined): StaffStatus {
  return status?.toLowerCase() === "inactive" ? "inactive" : "active";
}

function fallbackText(value: string | null | undefined) {
  return value?.trim() || "—";
}

function formatAccountDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function mapUserRoles(node: StaffUserNode): StaffAssignedRole[] {
  const ids = node.roleIds ?? [];
  const names = node.displayRolesNames ?? node.roles ?? [];

  return ids.map((id, index) => ({
    id,
    name: names[index]?.trim() || id,
  }));
}

/** Active staff = has at least one role, or is an owner. */
export function isActiveStaffUser(node: Pick<StaffUserNode, "roleIds" | "isOwner">): boolean {
  return (node.roleIds?.length ?? 0) > 0 || node.isOwner === true;
}

/** Active = roles not empty or owner; pending = no roles and not owner. */
export function resolveStaffTab(node: Pick<StaffUserNode, "roleIds" | "isOwner">): StaffTab {
  return isActiveStaffUser(node) ? "active" : "pending";
}

export function mapStaffUserToMemberRecord(node: StaffUserNode): StaffMemberRecord {
  return {
    id: node.id,
    name: node.fullName?.trim() || node.email,
    email: node.email,
    phoneNumber: node.formattedPhoneNumber?.trim() || node.phoneNumber?.trim() || "",
    profilePhotoUrl: node.avatar?.publicUrl ?? null,
    department: null,
    status: node.status ?? "active",
    reviewStatus: resolveStaffTab(node) === "pending" ? "PENDING" : "ACCEPTED",
    createdAt: node.createdAt ?? "",
    roles: mapUserRoles(node),
    isOwner: node.isOwner === true,
  };
}

export function mapStaffUserToDetails(node: StaffUserNode): StaffDetails {
  const roles = mapUserRoles(node);
  const status = toUiStatus(node.status);

  return {
    id: node.id,
    name: node.fullName?.trim() || node.email,
    status,
    isActive: status === "active",
    employeeId: node.id,
    email: node.email,
    phoneNumber: node.formattedPhoneNumber?.trim() || node.phoneNumber?.trim() || "",
    dateJoined: formatAccountDate(node.createdAt),
    createdBy: fallbackText(node.createdByUser?.fullName),
    accountAge: "—",
    lastLogin: "—",
    roles,
    rolesCount: roles.length,
    permissionsCount: node.permissions?.length ?? 0,
  };
}

export function mapStaffUserToFormInitialData(node: StaffUserNode): StaffFormInitialData {
  const roles = mapUserRoles(node);
  const avatar = node.avatar
    ? ({
        id: node.avatar.id,
        name: node.avatar.name,
        publicUrl: node.avatar.publicUrl,
      } satisfies UserAvatarInput)
    : null;

  return {
    id: node.id,
    fullName: node.fullName?.trim() || "",
    email: node.email,
    phoneNumber: node.phoneNumber?.trim() || "",
    countryCode: fromApiDialCode(node.countryCode ?? "SA"),
    roleIds: roles.map((role) => role.id),
    roles,
    department: "",
    isActive: toUiStatus(node.status) === "active",
    profilePhotoUrl: avatar?.publicUrl ?? null,
    avatar,
  };
}
