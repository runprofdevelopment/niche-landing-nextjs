"use client";
"use no memo";

import { useMemo } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import {
  Badge,
  createAccessorColumn,
  createDisplayColumn,
  createSelectColumn,
  DataTableCell,
  DataTableColumnHeader,
} from "@/shared/components";

import { ROLE_STATUS_BADGE_VARIANT, ROLE_STATUS_LABEL_KEYS } from "../../constants";
import { useRolePermissions } from "../../hooks";
import { RoleRowActions } from "../actions/role-row-actions";

import type { RoleListItem } from "../../types";
import type { ColumnDef } from "@/shared/components";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function useRoleColumns(): ColumnDef<RoleListItem, unknown>[] {
  const t = useTranslations("roles");
  const { canView, canUpdate, canDelete } = useRolePermissions();
  const hasAnyRowAction = canView || canUpdate || canDelete;

  return useMemo<ColumnDef<RoleListItem, unknown>[]>(() => {
    const columns: ColumnDef<RoleListItem, unknown>[] = [
      createSelectColumn<RoleListItem>(),
      createAccessorColumn<RoleListItem, string>("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnRoleName")} />
        ),
        cell: ({ row }) => (
          <DataTableCell className="font-medium">{row.original.name}</DataTableCell>
        ),
        meta: { label: t("columnRoleName"), align: "start" },
      }),
      createAccessorColumn<RoleListItem, string>("description", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnDescription")} />
        ),
        cell: ({ row }) => (
          <DataTableCell className="text-muted-foreground" maxWidthClassName="max-w-[18rem]">
            {row.original.description}
          </DataTableCell>
        ),
        meta: { label: t("columnDescription"), align: "start" },
      }),
      createAccessorColumn<RoleListItem, number>("permissionsCount", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnPermissions")} />
        ),
        meta: { label: t("columnPermissions") },
        enableSorting: false,
      }),
      createAccessorColumn<RoleListItem, number>("assignedUsersCount", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnAssignedUsers")} />
        ),
        meta: { label: t("columnAssignedUsers") },
        enableSorting: false,
      }),
      createAccessorColumn<RoleListItem, string>("createdAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("fieldCreatedAt")} />
        ),
        cell: ({ row }) => (
          <DataTableCell maxWidthClassName="max-w-[14rem]">
            {formatDateTime(row.original.createdAt)}
          </DataTableCell>
        ),
        size: 220,
        meta: { label: t("fieldCreatedAt") },
      }),
      createAccessorColumn<RoleListItem, RoleListItem["status"]>("status", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnStatus")} />,
        cell: ({ row }) => (
          <Badge variant={ROLE_STATUS_BADGE_VARIANT[row.original.status]} dot>
            {t(ROLE_STATUS_LABEL_KEYS[row.original.status])}
          </Badge>
        ),
        filterFn: (row, _columnId, filterValue) => {
          if (filterValue == null || filterValue === "") return true;
          return row.original.status === filterValue;
        },
        meta: { label: t("columnStatus") },
      }),
    ];

    if (hasAnyRowAction) {
      columns.push(
        createDisplayColumn<RoleListItem>("actions", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t("columnActions")} />
          ),
          cell: ({ row }) => <RoleRowActions role={row.original} />,
          meta: { label: t("columnActions") },
          enableSorting: false,
        }),
      );
    }

    return columns;
  }, [t, hasAnyRowAction]);
}

export { useRoleColumns };
