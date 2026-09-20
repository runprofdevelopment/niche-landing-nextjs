import { resolvePermissionOverviews } from "../../domain/permission-catalog";

import type { RoleDetails, RoleFormInitialData, RoleListItem, RoleStatus } from "../../types";
import type { RoleFindNode } from "../queries/role-find";
import type { RoleNode } from "../queries/role-list";

function toUiStatus(status: string | null | undefined): RoleStatus {
  return status?.toLowerCase() === "active" ? "active" : "inactive";
}

function fallbackText(value: string | null | undefined) {
  return value?.trim() || "-";
}

function employeeName(
  employee: { fullName: string | null } | null | undefined,
  fallback?: string | null,
) {
  return fallbackText(employee?.fullName ?? fallback);
}

export function mapRoleNodeToListItem(node: RoleNode): RoleListItem {
  const permissionKeys = node.permissionKeys ?? [];
  return {
    id: node.id,
    name: node.name,
    description: node.description?.trim() || "-",
    permissionsCount: permissionKeys.length,
    assignedUsersCount: 0,
    activeUsersCount: 0,
    status: toUiStatus(node.status),
    createdAt: node.createdAt ?? "",
    createdBy: fallbackText(node.createdBy),
    updatedAt: node.updatedAt ?? "",
    updatedBy: fallbackText(node.updatedBy),
  };
}

export function mapRoleFindNodeToDetails(node: RoleFindNode): RoleDetails {
  const permissionKeys = node.permissionKeys ?? [];
  const permissions = resolvePermissionOverviews(permissionKeys);
  const permissionsCount = node.permissionsCount ?? permissionKeys.length;

  return {
    id: node.id,
    name: node.name,
    description: node.description?.trim() || "-",
    permissionsCount,
    assignedUsersCount: node.assignedUsersCount ?? 0,
    activeUsersCount: 0,
    status: toUiStatus(node.status),
    createdBy: employeeName(node.createByEmployee, node.createdBy),
    createdAt: node.createdAt ?? "",
    updatedBy: employeeName(node.updateByEmployee),
    updatedAt: node.updatedAt ?? "",
    isActive: toUiStatus(node.status) === "active",
    permissions,
    permissionKeys,
    permissionModuleNames: Array.from(new Set(permissions.map((p) => p.moduleName))).sort(
      (left, right) => left.localeCompare(right),
    ),
  };
}

/** @deprecated Prefer `mapRoleFindNodeToDetails` for `roleFind` payloads. */
export function mapRoleNodeToDetails(node: RoleNode | RoleFindNode): RoleDetails {
  if ("createByEmployee" in node || "updateByEmployee" in node || "assignedUsersCount" in node) {
    return mapRoleFindNodeToDetails(node as RoleFindNode);
  }
  return mapRoleFindNodeToDetails({
    id: node.id,
    name: node.name,
    description: node.description,
    status: node.status,
    permissionKeys: node.permissionKeys,
    permissionsCount: node.permissionKeys?.length ?? 0,
    assignedUsersCount: 0,
    createdAt: node.createdAt,
    createdBy: "createdBy" in node ? node.createdBy : null,
    updatedAt: node.updatedAt,
    createByEmployee: null,
    updateByEmployee: null,
  });
}

export function mapRoleFindNodeToFormInitialData(node: RoleFindNode): RoleFormInitialData {
  return {
    id: node.id,
    name: node.name,
    description: node.description?.trim() || "",
    status: toUiStatus(node.status),
    permissionKeys: node.permissionKeys ?? [],
  };
}

export function mapRoleNodeToFormInitialData(node: RoleNode | RoleFindNode): RoleFormInitialData {
  return mapRoleFindNodeToFormInitialData({
    id: node.id,
    name: node.name,
    description: node.description,
    status: node.status,
    permissionKeys: node.permissionKeys,
    permissionsCount: null,
    assignedUsersCount: null,
    createdAt: node.createdAt,
    createdBy: "createdBy" in node ? node.createdBy : null,
    updatedAt: node.updatedAt,
    createByEmployee: null,
    updateByEmployee: null,
  });
}
