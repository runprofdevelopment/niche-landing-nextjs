"use client";
"use no memo";

import { UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { resolvePermissionOverviews } from "@/features/roles/domain/permission-catalog";
import { useRolePermissionsCatalog, useRolesByIds } from "@/features/roles/services";
import { useTranslations } from "@/hooks/useTranslations";
import { Badge, DataTableView, EmptyState, PageHeader, useDataTable } from "@/shared/components";

import { StaffDetailsActions } from "../components/actions/staff-details-actions";
import { StaffPersonalInfo } from "../components/staff-personal-info";
import { StaffRoles } from "../components/staff-roles";
import { usePermissionsAuditColumns } from "../components/tables/permissions-audit-columns";
import { STAFF_STATUS_BADGE_VARIANT, STAFF_STATUS_LABEL_KEYS } from "../constants";
import { useStaffMember } from "../services";

import type { StaffDetails, StaffPermissionAudit } from "../types";
import type { DataTableFilterDef } from "@/shared/components";
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";

type StaffDetailsViewProps = {
  staffId: string;
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

function StaffDetailsView({ staffId }: StaffDetailsViewProps) {
  const t = useTranslations("staff");
  const columns = usePermissionsAuditColumns();
  const {
    staffDetail,
    permissionKeys: profilePermissionKeys,
    roleIds,
    loading: staffLoading,
  } = useStaffMember({
    id: staffId,
  });

  const { permissionKeys: rolePermissionKeys, permissionModuleNames: roleModuleNames } =
    useRolesByIds({
      ids: roleIds,
      skip: profilePermissionKeys.length > 0 || roleIds.length === 0,
    });

  const permissionKeys =
    profilePermissionKeys.length > 0 ? profilePermissionKeys : rolePermissionKeys;

  const permissionModuleNames = useMemo(() => {
    if (profilePermissionKeys.length > 0) {
      return Array.from(
        new Set(resolvePermissionOverviews(profilePermissionKeys).map((item) => item.moduleName)),
      ).sort((left, right) => left.localeCompare(right));
    }
    return roleModuleNames;
  }, [profilePermissionKeys, roleModuleNames]);

  const staff = useMemo<StaffDetails | null>(() => {
    if (!staffDetail) return null;
    return {
      ...staffDetail,
      permissionsCount: permissionKeys.length,
    };
  }, [staffDetail, permissionKeys]);

  const moduleOptions = useMemo(
    () =>
      permissionModuleNames.map((name) => ({
        value: name,
        label: name,
      })),
    [permissionModuleNames],
  );

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

  const moduleName = useMemo(() => {
    const value = permColumnFilters.find((filter) => filter.id === "moduleName")?.value;
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
    permissions: permissionAuditRows,
    totalCount: permissionsTotalCount,
    pageInfo: permissionsPageInfo,
    loading: permissionsLoading,
  } = useRolePermissionsCatalog({
    keys: permissionKeys,
    keyContains,
    moduleName,
    limit: permPagination.pageSize,
    pageNumber: permPagination.pageIndex + 1,
    sort: permissionsSort,
    skip: permissionKeys.length === 0,
  });

  const table = useDataTable<StaffPermissionAudit>({
    data: permissionAuditRows,
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

  const permissionsFilterDefs: DataTableFilterDef[] = [
    {
      id: "moduleName",
      label: t("permColumnPanel"),
      type: "select",
      options: moduleOptions,
    },
  ];

  if (staffLoading && !staff) {
    return null;
  }

  if (!staff) {
    return <EmptyState icon={<UserRound />} title={t("staffDetailsTitle")} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {staff.name}
            <Badge variant={STAFF_STATUS_BADGE_VARIANT[staff.status]} dot>
              {t(STAFF_STATUS_LABEL_KEYS[staff.status])}
            </Badge>
          </span>
        }
        actions={<StaffDetailsActions staff={staff} />}
      />

      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          value={staff.accountAge}
          label={t("metricAccountAge")}
          icon={Calendar}
          tone="default"
          layout="split"
        />
        <KpiCard
          value={staff.lastLogin}
          label={t("metricLastLogin")}
          icon={Clock}
          tone="success"
          layout="split"
        />
        <KpiCard
          value={staff.rolesCount}
          label={t("metricRoles")}
          icon={Users}
          tone="warning"
          layout="split"
        />
        <KpiCard
          value={staff.permissionsCount}
          label={t("metricPermissions")}
          icon={ShieldCheck}
          tone="default"
          layout="split"
        />
      </div> */}

      <StaffPersonalInfo staff={staff} />

      <StaffRoles staff={staff} />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">{t("permissionsAuditTitle")}</h2>
        <DataTableView
          table={table}
          showSearch
          searchColumns={PERMISSIONS_SEARCH_COLUMNS}
          filters={permissionsFilterDefs}
          loading={permissionsLoading}
        />
      </div>
    </div>
  );
}

export { StaffDetailsView };
export type { StaffDetailsViewProps };
