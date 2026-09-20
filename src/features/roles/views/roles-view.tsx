"use client";
"use no memo";

import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { DataTableView, PageHeader, useDataTable } from "@/shared/components";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { useTableExport } from "@/shared/hooks";

import { RoleActions } from "../components/actions/role-actions";
import { useRoleColumns } from "../components/tables/columns";
import { ROLE_PERMISSIONS, ROLE_STATUS_LABEL_KEYS, ROLE_STATUS_OPTIONS } from "../constants";
import { buildRoleListFilters, buildRoleListSort } from "../graphql";
import { useRolePermissions } from "../hooks";
import { useRoles } from "../services";

import type { RoleListItem } from "../types";
import type { DataTableFilterDef } from "@/shared/components";
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_COLUMNS = ["name", "description"];

const EXPORT_FIELD_MAP: Record<string, string> = {
  name: "name",
  description: "description",
  status: "status",
  createdAt: "createdAt",
  permissionsCount: "permissionsCount",
  assignedUsersCount: "assignedUsersCount",
};

function RolesView() {
  const t = useTranslations("roles");
  const { canView } = useRolePermissions();
  const columns = useRoleColumns();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const serverFilters = useMemo(() => buildRoleListFilters({ columnFilters }), [columnFilters]);
  const sort = useMemo(() => buildRoleListSort(sorting), [sorting]);

  const { roles, totalCount, pageInfo, loading, refetch } = useRoles({
    limit: pagination.pageSize,
    pageNumber: pagination.pageIndex + 1,
    filters: serverFilters,
    sort,
  });

  const table = useDataTable<RoleListItem>({
    data: roles,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: pageInfo?.pagesCount || Math.ceil(totalCount / pagination.pageSize) || 1,
    controlledState: {
      state: {
        pagination,
        sorting,
        columnFilters,
      },
      onPaginationChange: (updater) => {
        setPagination((prev) => (typeof updater === "function" ? updater(prev) : updater));
      },
      onSortingChange: (updater) => {
        setSorting((prev) => (typeof updater === "function" ? updater(prev) : updater));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      },
      onColumnFiltersChange: (updater) => {
        setColumnFilters((prev) => (typeof updater === "function" ? updater(prev) : updater));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      },
    },
  });

  const { exporting, onExport } = useTableExport(table, {
    collectionName: "role",
    fieldMap: EXPORT_FIELD_MAP,
  });

  const filters: DataTableFilterDef[] = [
    {
      id: "status",
      label: t("columnStatus"),
      type: "select",
      options: ROLE_STATUS_OPTIONS.map((value) => ({
        value,
        label: t(ROLE_STATUS_LABEL_KEYS[value]),
      })),
    },
  ];

  return (
    <PermissionGate permission={ROLE_PERMISSIONS.view}>
      <div className="flex flex-col gap-6">
        <PageHeader title={t("pageTitle")} actions={<RoleActions />} />
        <DataTableView
          table={table}
          showSearch
          searchColumns={SEARCH_COLUMNS}
          filters={filters}
          loading={loading}
          onRefresh={() => {
            void refetch();
          }}
          {...(canView ? { onExport } : {})}
          exporting={exporting}
        />
      </div>
    </PermissionGate>
  );
}

export { RolesView };
