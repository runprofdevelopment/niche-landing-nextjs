"use client";
"use no memo";

import { Activity, KeyRound, UserRoundCog, Zap } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTableView,
  EmptyState,
  KpiCard,
  PageHeader,
  useDataTable,
} from "@/shared/components";

import { RoleDetailsActions } from "../components/actions/role-details-actions";
import { RoleDetailsInfo } from "../components/role-details-info";
import { usePermissionsOverviewColumns } from "../components/tables/permissions-overview-columns";
import { ROLE_STATUS_BADGE_VARIANT, ROLE_STATUS_LABEL_KEYS } from "../constants";
import { useRole, useRolePermissionsCatalog } from "../services";

import type { RolePermissionOverview } from "../types";
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";

type RoleDetailsViewProps = {
  roleId: string;
};

type BackendSortInput = { field: string; order: "asc" | "desc" };

const PERMISSIONS_PAGE_SIZE = 10;
const PERMISSIONS_SEARCH_COLUMNS = ["key"];

const PERMISSIONS_SORT_FIELD_MAP: Record<string, string> = {
  id: "id",
  key: "key",
  description: "description",
  moduleName: "moduleName",
};

function RoleDetailsView({ roleId }: RoleDetailsViewProps) {
  const t = useTranslations("roles");
  const columns = usePermissionsOverviewColumns();
  const { role, loading } = useRole({ id: roleId });

  const permissionKeys = useMemo(() => role?.permissionKeys ?? [], [role?.permissionKeys]);

  const [permPagination, setPermPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PERMISSIONS_PAGE_SIZE,
  });
  const [permColumnFilters, setPermColumnFilters] = useState<ColumnFiltersState>([]);
  const [permSorting, setPermSorting] = useState<SortingState>([]);

  const keyContains = useMemo(() => {
    const value = permColumnFilters.find((filter) => filter.id === "key")?.value;
    return value == null || value === "" ? undefined : String(value);
  }, [permColumnFilters]);

  const permissionsSort = useMemo<BackendSortInput[] | undefined>(() => {
    const next = permSorting
      .map((entry): BackendSortInput | null => {
        const field = PERMISSIONS_SORT_FIELD_MAP[entry.id];
        if (!field) return null;
        return { field, order: entry.desc ? "desc" : "asc" };
      })
      .filter((entry): entry is BackendSortInput => entry != null);

    return next.length > 0 ? next : undefined;
  }, [permSorting]);

  const {
    permissions: permissionOverviewRows,
    totalCount: permissionsTotalCount,
    pageInfo: permissionsPageInfo,
    loading: permissionsLoading,
  } = useRolePermissionsCatalog({
    keys: permissionKeys,
    keyContains,
    limit: permPagination.pageSize,
    pageNumber: permPagination.pageIndex + 1,
    sort: permissionsSort,
    skip: permissionKeys.length === 0,
  });

  const permissionsTable = useDataTable<RolePermissionOverview>({
    data: permissionOverviewRows,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount:
      permissionsPageInfo?.pagesCount ||
      Math.ceil(permissionsTotalCount / permPagination.pageSize) ||
      1,
    controlledState: {
      state: {
        pagination: permPagination,
        sorting: permSorting,
        columnFilters: permColumnFilters,
      },
      onPaginationChange: (updater) => {
        setPermPagination((prev) => (typeof updater === "function" ? updater(prev) : updater));
      },
      onSortingChange: (updater) => {
        setPermSorting((prev) => (typeof updater === "function" ? updater(prev) : updater));
        setPermPagination((prev) => ({ ...prev, pageIndex: 0 }));
      },
      onColumnFiltersChange: (updater) => {
        setPermColumnFilters((prev) => (typeof updater === "function" ? updater(prev) : updater));
        setPermPagination((prev) => ({ ...prev, pageIndex: 0 }));
      },
    },
  });

  if (loading && !role) {
    return null;
  }

  if (!role) {
    return <EmptyState icon={<KeyRound />} title={t("roleDetailsTitle")} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {role.name}
            <Badge variant={ROLE_STATUS_BADGE_VARIANT[role.status]} dot>
              {t(ROLE_STATUS_LABEL_KEYS[role.status])}
            </Badge>
          </span>
        }
        actions={<RoleDetailsActions roleId={role.id} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          value={role.permissionsCount}
          label={t("metricTotalPermissions")}
          icon={UserRoundCog}
          tone="default"
          layout="split"
          className="min-h-28"
        />
        <KpiCard
          value={role.assignedUsersCount}
          label={t("metricAssignedUsers")}
          icon={Zap}
          tone="warning"
          layout="split"
          className="min-h-28"
        />
        <KpiCard
          value={role.activeUsersCount}
          label={t("metricActiveUsers")}
          icon={Activity}
          tone="success"
          layout="split"
          className="min-h-28"
        />
      </div>

      <RoleDetailsInfo role={role} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("roleDescriptionTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{role.description}</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">{t("permissionsOverviewTitle")}</h2>
        <DataTableView
          table={permissionsTable}
          showSearch
          searchColumns={PERMISSIONS_SEARCH_COLUMNS}
          loading={permissionsLoading}
        />
      </div>
    </div>
  );
}

export { RoleDetailsView };
