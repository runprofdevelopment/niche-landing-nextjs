"use client";
"use no memo";

import { useCallback, useMemo, useState } from "react";

import { REGISTRATION_USERS_PERMISSIONS } from "@/constants/permissions";
import { CreateEventDialog } from "@/features/events/components/dialogs/CreateEventDialog";
import { useTranslations } from "@/hooks/useTranslations";
import {
  Badge,
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

import { useRegistrationUsersColumns } from "../components/tables/columns";
import { REGISTRATION_USERS_TABS, type RegistrationUsersTab } from "../constants";
import { buildGuestListFilters, buildGuestListSort } from "../graphql";
import { useRegistrationUsersPermissions } from "../hooks";
import { useRegistrationUsers } from "../services";

import type { RegistrationUser } from "../types";
import type { DataTableFilterDef } from "@/shared/components";

const SEARCH_COLUMNS = ["name", "email"];

const HIDDEN_FILTER_COLUMN_VISIBILITY = { createdAt: false } as const;

const EXPORT_FIELD_MAP: Record<string, string> = {
  name: "fullName",
  email: "email",
  phoneNumber: "formattedPhoneNumber",
  guestType: "guestType",
  registeredAt: "createdAt",
};

type RegistrationUsersViewProps = {
  initialTab?: RegistrationUsersTab;
};

function RegistrationUsersView({ initialTab = "guest" }: RegistrationUsersViewProps) {
  const t = useTranslations("registrationUsers");
  const { canView } = useRegistrationUsersPermissions();
  const [tab, setTab] = useState<RegistrationUsersTab>(initialTab);
  const [createEventOwner, setCreateEventOwner] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleMarkedAsOwner = useCallback((user: RegistrationUser) => {
    setCreateEventOwner({ id: user.id, name: user.name });
  }, []);

  const columns = useRegistrationUsersColumns({ onMarkedAsOwner: handleMarkedAsOwner });

  const dateFilterDef: DataTableFilterDef = {
    id: "createdAt",
    label: t("filterRegisteredAt"),
    type: "dateRange",
  };

  const guestTableState = useDataTableState({
    columnVisibility: HIDDEN_FILTER_COLUMN_VISIBILITY,
  });
  const guestSort = useMemo(
    () => buildGuestListSort(guestTableState.state.sorting),
    [guestTableState.state.sorting],
  );
  const guestFilters = useMemo(
    () =>
      buildGuestListFilters({
        tab: "guest",
        columnFilters: guestTableState.state.columnFilters,
      }),
    [guestTableState.state.columnFilters],
  );
  const { pagination: guestPagination } = guestTableState.state;
  const {
    users: guestUsers,
    totalCount: guestTotal,
    pageCount: guestPageCount,
    loading: guestLoading,
    refetch: refetchGuest,
  } = useRegistrationUsers({
    limit: guestPagination.pageSize,
    pageNumber: guestPagination.pageIndex + 1,
    filters: guestFilters,
    ...(guestSort ? { sort: guestSort } : {}),
    skip: tab !== "guest",
  });

  const ownerTableState = useDataTableState({
    columnVisibility: HIDDEN_FILTER_COLUMN_VISIBILITY,
  });
  const ownerSort = useMemo(
    () => buildGuestListSort(ownerTableState.state.sorting),
    [ownerTableState.state.sorting],
  );
  const ownerFilters = useMemo(
    () =>
      buildGuestListFilters({
        tab: "owner",
        columnFilters: ownerTableState.state.columnFilters,
      }),
    [ownerTableState.state.columnFilters],
  );
  const { pagination: ownerPagination } = ownerTableState.state;
  const {
    users: ownerUsers,
    totalCount: ownerTotal,
    pageCount: ownerPageCount,
    loading: ownerLoading,
    refetch: refetchOwner,
  } = useRegistrationUsers({
    limit: ownerPagination.pageSize,
    pageNumber: ownerPagination.pageIndex + 1,
    filters: ownerFilters,
    ...(ownerSort ? { sort: ownerSort } : {}),
    skip: tab !== "owner",
  });

  const guestTable = useDataTable<RegistrationUser>({
    data: guestUsers,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState: guestTableState,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: guestPageCount,
  });

  const ownerTable = useDataTable<RegistrationUser>({
    data: ownerUsers,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState: ownerTableState,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: ownerPageCount,
  });

  const guestExport = useTableExport(guestTable, {
    collectionName: "user",
    fieldMap: EXPORT_FIELD_MAP,
    excludeColumnIds: ["createdAt"],
  });
  const ownerExport = useTableExport(ownerTable, {
    collectionName: "user",
    fieldMap: EXPORT_FIELD_MAP,
    excludeColumnIds: ["createdAt"],
  });

  const totalCount = guestTotal + ownerTotal;
  const activeTotal = tab === "guest" ? guestTotal : ownerTotal;

  return (
    <PermissionGate permission={REGISTRATION_USERS_PERMISSIONS.view}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={
            <span className="flex flex-wrap items-center gap-3">
              {t("pageTitle")}
              <Badge variant="secondary">{totalCount}</Badge>
            </span>
          }
        />
        <Tabs value={tab} onValueChange={(value) => setTab(value as RegistrationUsersTab)}>
          <TabsList>
            {REGISTRATION_USERS_TABS.map((item) => (
              <TabsTab key={item.value} value={item.value}>
                {t(item.labelKey)}
              </TabsTab>
            ))}
          </TabsList>
          <TabsPanel value="guest">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{t("tabRegistrationUsers")}</h2>
              <Badge variant="secondary">{guestTotal}</Badge>
            </div>
            <DataTableView
              table={guestTable}
              showSearch
              searchColumns={SEARCH_COLUMNS}
              filters={[dateFilterDef]}
              totalCount={activeTotal}
              loading={guestLoading}
              onRefresh={() => {
                void refetchGuest();
              }}
              {...(canView ? { onExport: guestExport.onExport } : {})}
              exporting={guestExport.exporting}
            />
          </TabsPanel>
          <TabsPanel value="owner">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{t("tabOwners")}</h2>
              <Badge variant="secondary">{ownerTotal}</Badge>
            </div>
            <DataTableView
              table={ownerTable}
              showSearch
              searchColumns={SEARCH_COLUMNS}
              filters={[dateFilterDef]}
              totalCount={ownerTotal}
              loading={ownerLoading}
              onRefresh={() => {
                void refetchOwner();
              }}
              {...(canView ? { onExport: ownerExport.onExport } : {})}
              exporting={ownerExport.exporting}
            />
          </TabsPanel>
        </Tabs>

        <CreateEventDialog
          open={createEventOwner != null}
          onOpenChange={(open) => {
            if (!open) setCreateEventOwner(null);
          }}
          defaultOwnerId={createEventOwner?.id ?? ""}
          defaultOwnerLabel={createEventOwner?.name ?? ""}
        />
      </div>
    </PermissionGate>
  );
}

export { RegistrationUsersView };
