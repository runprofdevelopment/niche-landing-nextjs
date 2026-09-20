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

import {
  STAFF_STATUS_BADGE_VARIANT,
  STAFF_STATUS_LABEL_KEYS,
  type StaffTab,
} from "../../constants";
import { useStaffPermissions } from "../../hooks";
import { StaffPendingRowActions } from "../actions/staff-pending-row-actions";
import { StaffRowActions } from "../actions/staff-row-actions";

import type { StaffMember } from "../../types";
import type { ColumnDef } from "@/shared/components";

function useStaffColumns(
  tab: StaffTab,
  options?: { showRowActions?: boolean },
): ColumnDef<StaffMember, unknown>[] {
  const t = useTranslations("staff");
  const { canView, canUpdate, canDelete } = useStaffPermissions();
  const showRowActions = options?.showRowActions !== false;

  const hasActiveRowAction = showRowActions && (canView || canUpdate || canDelete);
  const hasPendingRowAction = showRowActions && (canUpdate || canView);

  return useMemo<ColumnDef<StaffMember, unknown>[]>(() => {
    const columns: ColumnDef<StaffMember, unknown>[] = [
      createSelectColumn<StaffMember>(),
      {
        id: "roleId",
        accessorFn: (row) => row.roles.map((role) => role.id).join(","),
        header: t("columnAssignedRoles"),
        cell: () => null,
        enableHiding: false,
        enableSorting: false,
        filterFn: "equals",
        meta: { label: t("columnAssignedRoles") },
      },
      createAccessorColumn<StaffMember, string>("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnEmployeeName")} />
        ),
        cell: ({ row }) => (
          <DataTableCell className="font-medium">{row.original.name}</DataTableCell>
        ),
        meta: { label: t("columnEmployeeName"), align: "start" },
      }),
      createAccessorColumn<StaffMember, string>("email", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnEmail")} />,
        meta: { label: t("columnEmail"), align: "start" },
      }),
      createAccessorColumn<StaffMember, string>("phoneNumber", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnPhone")} />,
        meta: { label: t("columnPhone"), align: "start" },
      }),
    ];

    if (tab === "active") {
      columns.push(
        createDisplayColumn<StaffMember>("roles", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t("columnAssignedRoles")} />
          ),
          cell: ({ row }) =>
            row.original.roles.length > 0 ? (
              <DataTableCell className="flex flex-wrap gap-1">
                {row.original.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </DataTableCell>
            ) : (
              <DataTableCell className="text-muted-foreground">{t("roleNone")}</DataTableCell>
            ),
          enableSorting: false,
          meta: { label: t("columnAssignedRoles"), align: "start" },
        }),
      );
    }

    if (tab === "active") {
      columns.push(
        createDisplayColumn<StaffMember>("status", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t("columnStatus")} />
          ),
          cell: ({ row }) => (
            <Badge variant={STAFF_STATUS_BADGE_VARIANT[row.original.status]} dot>
              {t(STAFF_STATUS_LABEL_KEYS[row.original.status])}
            </Badge>
          ),
          filterFn: (row, _columnId, filterValue) => {
            if (filterValue == null || filterValue === "") return true;
            return row.original.status === filterValue;
          },
          meta: { label: t("columnStatus") },
        }),
      );
    }

    const showActions = tab === "pending" ? hasPendingRowAction : hasActiveRowAction;

    if (showActions) {
      columns.push(
        createDisplayColumn<StaffMember>("actions", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t("columnActions")} />
          ),
          cell: ({ row }) =>
            tab === "pending" ? (
              <StaffPendingRowActions staff={row.original} />
            ) : (
              <StaffRowActions staff={row.original} />
            ),
          meta: { label: t("columnActions") },
        }),
      );
    }

    return columns;
  }, [t, tab, hasActiveRowAction, hasPendingRowAction]);
}

export { useStaffColumns };
