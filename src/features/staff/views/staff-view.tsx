"use client";
"use no memo";

import { useMemo, useState } from "react";

import { STAFF_PERMISSIONS } from "@/constants/permissions";
import { useInfiniteRoles } from "@/features/roles/services";
import { useTranslations } from "@/hooks/useTranslations";
import {
  DataTableView,
  PageHeader,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  useDataTable,
  useDataTableState,
} from "@/shared/components";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { useTableExport } from "@/shared/hooks";

import { StaffActions } from "../components/actions/staff-actions";
import { useStaffColumns } from "../components/tables/columns";
import {
  STAFF_STATUS_LABEL_KEYS,
  STAFF_STATUS_OPTIONS,
  STAFF_TABS,
  type StaffTab,
} from "../constants";
import { buildStaffUserListFilters, buildStaffUserListSort } from "../graphql";
import { useStaffPermissions } from "../hooks";
import { useStaffMembers } from "../services";

import type { StaffMemberRecord } from "../services";
import type { StaffMember } from "../types";
import type { DataTableFilterDef } from "@/shared/components";
import type { ReactNode } from "react";

const SEARCH_COLUMNS = ["name", "email"];

/** The `roleId` column exists only to back the role filter — never shown as a table column. */
const HIDDEN_FILTER_COLUMN_VISIBILITY = { roleId: false } as const;

const EXPORT_FIELD_MAP: Record<string, string> = {
  name: "fullName",
  email: "email",
  phoneNumber: "formattedPhoneNumber",
  roles: "roleIds",
  status: "status",
};

type StaffViewProps = {
  title?: ReactNode;
  /** Which tab is active on mount. Defaults to `'active'`. */
  initialTab?: StaffTab;
};

function toStaffMember(record: StaffMemberRecord, tab: StaffTab): StaffMember {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phoneNumber: record.phoneNumber,
    roles: record.roles,
    department: "—",
    status: record.status?.toLowerCase() === "inactive" ? "inactive" : "active",
    state: tab,
  };
}

function StaffView({ title, initialTab = "active" }: StaffViewProps) {
  const t = useTranslations("staff");
  const { canView } = useStaffPermissions();
  const [tab, setTab] = useState<StaffTab>(initialTab);

  const [roleFilterSearch, setRoleFilterSearch] = useState("");
  const {
    options: roleFilterOptions,
    loading: roleFilterLoading,
    hasMore: roleFilterHasMore,
    loadMore: loadMoreRoles,
  } = useInfiniteRoles({ search: roleFilterSearch });

  const pendingColumns = useStaffColumns("pending");
  const activeColumns = useStaffColumns("active");

  const pendingTableState = useDataTableState({
    columnVisibility: HIDDEN_FILTER_COLUMN_VISIBILITY,
  });
  const pendingSort = useMemo(
    () => buildStaffUserListSort(pendingTableState.state.sorting),
    [pendingTableState.state.sorting],
  );
  const pendingFilters = useMemo(
    () =>
      buildStaffUserListFilters({
        columnFilters: pendingTableState.state.columnFilters,
      }),
    [pendingTableState.state.columnFilters],
  );
  const { pagination: pendingPagination } = pendingTableState.state;
  const {
    staff: pendingRecords,
    totalCount: pendingTotal,
    loading: pendingLoading,
    refetch: refetchPending,
  } = useStaffMembers({
    tab: "pending",
    limit: pendingPagination.pageSize,
    pageNumber: pendingPagination.pageIndex + 1,
    filters: pendingFilters,
    sort: pendingSort,
    skip: tab !== "pending",
  });
  const pendingData = useMemo(
    () => pendingRecords.map((record) => toStaffMember(record, "pending")),
    [pendingRecords],
  );
  const pendingPageCount = Math.max(1, Math.ceil(pendingTotal / pendingPagination.pageSize));

  const activeTableState = useDataTableState({
    columnVisibility: HIDDEN_FILTER_COLUMN_VISIBILITY,
  });
  const activeSort = useMemo(
    () => buildStaffUserListSort(activeTableState.state.sorting),
    [activeTableState.state.sorting],
  );
  const activeFilters = useMemo(
    () =>
      buildStaffUserListFilters({
        columnFilters: activeTableState.state.columnFilters,
      }),
    [activeTableState.state.columnFilters],
  );
  const { pagination: activePagination } = activeTableState.state;
  const {
    staff: activeRecords,
    totalCount: activeTotal,
    loading: activeLoading,
    refetch: refetchActive,
  } = useStaffMembers({
    tab: "active",
    limit: activePagination.pageSize,
    pageNumber: activePagination.pageIndex + 1,
    filters: activeFilters,
    sort: activeSort,
    skip: tab !== "active",
  });
  const activeData = useMemo(
    () => activeRecords.map((record) => toStaffMember(record, "active")),
    [activeRecords],
  );
  const activePageCount = Math.max(1, Math.ceil(activeTotal / activePagination.pageSize));

  const pendingTable = useDataTable<StaffMember>({
    data: pendingData,
    columns: pendingColumns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState: pendingTableState,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: pendingPageCount,
  });

  const activeTable = useDataTable<StaffMember>({
    data: activeData,
    columns: activeColumns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState: activeTableState,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: activePageCount,
  });

  const pendingExport = useTableExport(pendingTable, {
    collectionName: "user",
    fieldMap: EXPORT_FIELD_MAP,
    excludeColumnIds: ["roleId"],
  });
  const activeExport = useTableExport(activeTable, {
    collectionName: "user",
    fieldMap: EXPORT_FIELD_MAP,
    excludeColumnIds: ["roleId"],
  });

  const roleFilterDef: DataTableFilterDef = {
    id: "roleId",
    label: t("columnAssignedRoles"),
    type: "asyncSelect",
    options: roleFilterOptions,
    loading: roleFilterLoading,
    hasMore: roleFilterHasMore,
    onLoadMore: loadMoreRoles,
    onSearchChange: setRoleFilterSearch,
  };

  const pendingFilterDefs: DataTableFilterDef[] = [];
  const activeFilterDefs: DataTableFilterDef[] = [
    {
      id: "status",
      label: t("columnStatus"),
      type: "select",
      options: STAFF_STATUS_OPTIONS.map((value) => ({
        value,
        label: t(STAFF_STATUS_LABEL_KEYS[value]),
      })),
    },
    roleFilterDef,
  ];

  const resolvedTitle = title ?? t("pageTitle");

  return (
    <PermissionGate permission={STAFF_PERMISSIONS.view}>
      <div className="flex flex-col gap-6">
        <PageHeader title={resolvedTitle} actions={<StaffActions />} />
        <Tabs value={tab} onValueChange={(value) => setTab(value as StaffTab)}>
          <TabsList>
            {STAFF_TABS.map((staffTab) => (
              <TabsTab key={staffTab.value} value={staffTab.value}>
                {t(staffTab.labelKey)}
              </TabsTab>
            ))}
          </TabsList>
          <TabsPanel value="active">
            <DataTableView
              table={activeTable}
              showSearch
              searchColumns={SEARCH_COLUMNS}
              filters={activeFilterDefs}
              totalCount={activeTotal}
              loading={activeLoading}
              onRefresh={() => {
                void refetchActive();
              }}
              {...(canView ? { onExport: activeExport.onExport } : {})}
              exporting={activeExport.exporting}
            />
          </TabsPanel>
          <TabsPanel value="pending">
            <DataTableView
              table={pendingTable}
              showSearch
              searchColumns={SEARCH_COLUMNS}
              filters={pendingFilterDefs}
              totalCount={pendingTotal}
              loading={pendingLoading}
              onRefresh={() => {
                void refetchPending();
              }}
              {...(canView ? { onExport: pendingExport.onExport } : {})}
              exporting={pendingExport.exporting}
            />
          </TabsPanel>
        </Tabs>
      </div>
    </PermissionGate>
  );
}

export { StaffView };
export type { StaffViewProps };
