"use client";
"use no memo";

import { useMemo } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import {
  createAccessorColumn,
  createSelectColumn,
  DataTableCell,
  DataTableColumnHeader,
} from "@/shared/components";

import type { RolePermissionOverview } from "../../types";
import type { ColumnDef } from "@/shared/components";

function usePermissionsOverviewColumns(): ColumnDef<RolePermissionOverview, unknown>[] {
  const t = useTranslations("roles");

  return useMemo<ColumnDef<RolePermissionOverview, unknown>[]>(
    () => [
      createSelectColumn<RolePermissionOverview>(),
      createAccessorColumn<RolePermissionOverview, string>("key", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("permColumnKey")} />
        ),
        cell: ({ row }) => (
          <DataTableCell className="font-medium">{row.original.key}</DataTableCell>
        ),
        meta: { label: t("permColumnKey"), align: "start" },
      }),
      createAccessorColumn<RolePermissionOverview, string>("description", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("permColumnDescription")} />
        ),
        cell: ({ row }) => (
          <DataTableCell className="text-muted-foreground">
            {row.original.description}
          </DataTableCell>
        ),
        meta: { label: t("permColumnDescription"), align: "start" },
      }),
      createAccessorColumn<RolePermissionOverview, string>("moduleName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("permColumnPanel")} />
        ),
        meta: { label: t("permColumnPanel"), align: "start" },
      }),
    ],
    [t],
  );
}

export { usePermissionsOverviewColumns };
