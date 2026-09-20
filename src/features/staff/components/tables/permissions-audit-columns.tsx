"use client";
"use no memo";

import { useMemo } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { createAccessorColumn, DataTableCell, DataTableColumnHeader } from "@/shared/components";

import type { StaffPermissionAudit } from "../../types";
import type { ColumnDef } from "@/shared/components";

function usePermissionsAuditColumns(): ColumnDef<StaffPermissionAudit, unknown>[] {
  const t = useTranslations("staff");

  return useMemo<ColumnDef<StaffPermissionAudit, unknown>[]>(
    () => [
      createAccessorColumn<StaffPermissionAudit, string>("key", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("permColumnKey")} />
        ),
        cell: ({ row }) => (
          <DataTableCell className="font-medium">{row.original.key}</DataTableCell>
        ),
        meta: { label: t("permColumnKey"), align: "start" },
      }),
      createAccessorColumn<StaffPermissionAudit, string>("description", {
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
      createAccessorColumn<StaffPermissionAudit, string>("moduleName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("permColumnPanel")} />
        ),
        meta: { label: t("permColumnPanel"), align: "start" },
      }),
    ],
    [t],
  );
}

export { usePermissionsAuditColumns };
