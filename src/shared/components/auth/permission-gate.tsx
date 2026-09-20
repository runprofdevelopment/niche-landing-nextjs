"use client";

import { usePermissions } from "@/hooks/usePermissions";

import { AccessDenied } from "./access-denied";

import type { PermissionKey } from "@/constants/permissions";

type PermissionGateProps = {
  permission: PermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/** Renders children only when the user has the given permission (admins always pass). */
export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <>{fallback ?? <AccessDenied />}</>;
  }

  return <>{children}</>;
}
