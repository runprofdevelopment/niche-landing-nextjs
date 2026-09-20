import { PERMISSIONS, type PermissionKey } from "@/constants/permissions";

import type { PermissionItem, PermissionModule, RolePermissionOverview } from "../types";

type PermissionGroupKey = keyof typeof PERMISSIONS;

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  share: "Share",
  approve: "Approve",
  reject: "Reject",
  generate: "Generate",
};

/** Humanizes a camelCase / dotted segment: `checkIn` → `check in`, `members` → `members`. */
function humanizeSegment(segment: string): string {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .trim();
}

/** `event` → `Event`, `checkIn` → `Check In`. */
export function formatPermissionModuleName(moduleKey: string): string {
  return humanizeSegment(moduleKey)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Builds a short description from a permission key.
 * Examples: `event.create` → "Create event", `security.members.approve` → "Approve security members".
 */
export function describePermissionKey(key: string): string {
  const parts = key.split(".").filter(Boolean);
  if (parts.length === 0) return key;

  const action = parts[parts.length - 1] ?? key;
  const resource = parts.slice(0, -1).map(humanizeSegment).join(" ").trim();

  const verb =
    ACTION_LABELS[action] ?? humanizeSegment(action).replace(/^./, (c) => c.toUpperCase());
  if (!resource) return verb;
  return `${verb} ${resource}`;
}

function catalogEntries(): Array<{
  moduleKey: PermissionGroupKey;
  moduleName: string;
  key: PermissionKey;
}> {
  return (Object.keys(PERMISSIONS) as PermissionGroupKey[]).flatMap((moduleKey) => {
    const group = PERMISSIONS[moduleKey];
    const moduleName = formatPermissionModuleName(moduleKey);
    return (Object.values(group) as PermissionKey[]).map((key) => ({
      moduleKey,
      moduleName,
      key,
    }));
  });
}

/** Flat catalog — always mirrors `PERMISSIONS` / `ALL_PERMISSION_KEYS`. */
export function getPermissionCatalogItems(): RolePermissionOverview[] {
  return catalogEntries()
    .map(({ key, moduleName }) => ({
      id: key,
      key,
      description: describePermissionKey(key),
      moduleName,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

/** Modules for the role form permission selector — grouped by `PERMISSIONS` keys. */
export function getPermissionModules(): PermissionModule[] {
  return (Object.keys(PERMISSIONS) as PermissionGroupKey[])
    .map((moduleKey) => {
      const group = PERMISSIONS[moduleKey];
      const permissions: PermissionItem[] = (Object.values(group) as PermissionKey[])
        .map((key) => ({
          id: key,
          key,
          description: describePermissionKey(key),
        }))
        .sort((left, right) => left.key.localeCompare(right.key));

      return {
        id: moduleKey,
        name: formatPermissionModuleName(moduleKey),
        permissions,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function resolvePermissionOverviews(keys: string[]): RolePermissionOverview[] {
  const catalog = new Map(getPermissionCatalogItems().map((item) => [item.key, item]));
  const unique = Array.from(new Set(keys.filter(Boolean)));

  return unique
    .map((key) => {
      const known = catalog.get(key);
      if (known) return known;
      const moduleKey = key.split(".")[0] ?? key;
      return {
        id: key,
        key,
        description: describePermissionKey(key),
        moduleName: formatPermissionModuleName(moduleKey),
      };
    })
    .sort((left, right) => left.key.localeCompare(right.key));
}
