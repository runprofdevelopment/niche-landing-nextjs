"use client";
"use no memo";

import { useEffect, useMemo } from "react";

import {
  buildFrontDeskListFilters,
  buildFrontDeskListSort,
  useFrontDeskListQuery,
} from "@/features/security/graphql";
import { useTranslations } from "@/hooks/useTranslations";
import {
  createAccessorColumn,
  createDisplayColumn,
  createSelectColumn,
  DataTableColumnHeader,
  DataTableView,
  useDataTable,
  useDataTableState,
} from "@/shared/components/table";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTableExport } from "@/shared/hooks";

import { MembersTableRowActions } from "./MembersTableRowActions";

import type { FrontDeskListTab } from "../../graphql";
import type { SecurityMember, SecurityMemberStatus } from "../../types";
import type { DataTableFilterDef } from "@/shared/components/table";
import type { ColumnDef } from "@tanstack/react-table";

type FrontDeskTableRow = SecurityMember & {
  gender: string;
  createdAt: string;
};

export type MembersTab = FrontDeskListTab;

const SEARCH_COLUMNS = ["name", "phone", "email"];

const STATUS_BADGE_VARIANT = {
  active: "success",
  inactive: "inactive",
  pending: "warning",
  rejected: "destructive",
} as const satisfies Record<
  SecurityMemberStatus,
  "success" | "inactive" | "warning" | "destructive"
>;

export function filterMembersByTab(members: SecurityMember[], tab: MembersTab): SecurityMember[] {
  if (tab === "pending") return members.filter((member) => member.status === "pending");
  return members.filter((member) => member.status === "active" || member.status === "inactive");
}

type MembersTableProps = {
  tab: MembersTab;
  onTabChange: (tab: MembersTab) => void;
  onTotalCountChange?: (totalCount: number) => void;
};

export function MembersTable({ tab, onTabChange, onTotalCountChange }: MembersTableProps) {
  const t = useTranslations("security");
  const controlledState = useDataTableState({
    columnVisibility: { gender: false, createdAt: false },
  });
  const emptyValue = t("emptyValue");

  const filtersInput = useMemo(
    () =>
      buildFrontDeskListFilters({
        tab,
        columnFilters: controlledState.state.columnFilters,
      }),
    [controlledState.state.columnFilters, tab],
  );

  const sortInput = useMemo(
    () => buildFrontDeskListSort(controlledState.state.sorting),
    [controlledState.state.sorting],
  );

  const paginationInput = useMemo(
    () => ({
      limit: controlledState.state.pagination.pageSize,
      page: controlledState.state.pagination.pageIndex + 1,
    }),
    [controlledState.state.pagination.pageIndex, controlledState.state.pagination.pageSize],
  );

  const { members, totalCount, pageCount, loading, refetch } = useFrontDeskListQuery({
    ...(sortInput ? { sort: sortInput } : {}),
    pagination: paginationInput,
    filters: filtersInput,
  });

  useEffect(() => {
    onTotalCountChange?.(totalCount);
  }, [onTotalCountChange, totalCount]);

  const statusLabel = useMemo(
    () =>
      ({
        active: t("statusActive"),
        inactive: t("statusInactive"),
        pending: t("statusPending"),
        rejected: t("statusRejected"),
      }) satisfies Record<SecurityMemberStatus, string>,
    [t],
  );

  const filters = useMemo<DataTableFilterDef[]>(() => {
    const next: DataTableFilterDef[] = [];
    if (tab === "active") {
      next.push({
        id: "status",
        label: t("filterStatus"),
        type: "select",
        options: [
          { value: "active", label: t("statusActive") },
          { value: "inactive", label: t("statusInactive") },
        ],
      });
    }
    next.push({
      id: "createdAt",
      label: t("filterRegisteredAt"),
      type: "dateRange",
    });
    return next;
  }, [t, tab]);

  const rows = useMemo<FrontDeskTableRow[]>(
    () => members.map((member) => ({ ...member, gender: "", createdAt: "" })),
    [members],
  );

  const columns = useMemo<ColumnDef<FrontDeskTableRow, unknown>[]>(
    () => [
      createSelectColumn<FrontDeskTableRow>(),
      createAccessorColumn<FrontDeskTableRow, string>("name", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnName")} />,
        meta: { label: t("columnName"), align: "start" },
      }),
      createAccessorColumn<FrontDeskTableRow, string>("phone", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnPhone")} />,
        cell: ({ getValue }) => getValue() || emptyValue,
        meta: { label: t("columnPhone"), align: "start" },
      }),
      createAccessorColumn<FrontDeskTableRow, string>("email", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnEmail")} />,
        meta: { label: t("columnEmail"), align: "start" },
      }),
      createAccessorColumn<FrontDeskTableRow, SecurityMemberStatus>("status", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnStatus")} />,
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <Badge variant={STATUS_BADGE_VARIANT[status]} dot>
              {statusLabel[status]}
            </Badge>
          );
        },
        meta: { label: t("columnStatus"), align: "center" },
      }),
      createAccessorColumn<FrontDeskTableRow, string>("gender", {
        header: t("filterGender"),
        enableHiding: false,
        enableSorting: false,
        size: 0,
        meta: { label: t("filterGender") },
      }),
      createAccessorColumn<FrontDeskTableRow, string>("createdAt", {
        header: t("filterRegisteredAt"),
        enableHiding: false,
        enableSorting: false,
        size: 0,
        meta: { label: t("filterRegisteredAt") },
      }),
      createDisplayColumn<FrontDeskTableRow>("actions", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnActions")} />
        ),
        cell: ({ row }) => <MembersTableRowActions member={row.original} />,
        enableHiding: false,
        enableSorting: false,
        size: 72,
        meta: { label: t("columnActions"), align: "end" },
      }),
    ],
    [emptyValue, statusLabel, t],
  );

  const table = useDataTable<FrontDeskTableRow, unknown>({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount,
  });

  const { exporting, onExport } = useTableExport(table, {
    collectionName: "security-members",
    fieldMap: {
      name: "name",
      phone: "phone",
      email: "email",
      status: "status",
    },
  });

  function handleTabChange(value: string) {
    onTabChange(value as MembersTab);
    table.resetRowSelection();
    controlledState.onColumnFiltersChange((previous) =>
      previous.filter((filter) => filter.id !== "status"),
    );
    controlledState.onPaginationChange((previous) => ({ ...previous, pageIndex: 0 }));
  }

  return (
    <DataTableView
      table={table}
      caption={t("frontDeskMembersTitle")}
      emptyMessage={t("noMembersInTab")}
      searchColumns={SEARCH_COLUMNS}
      filters={filters}
      loading={loading}
      totalCount={totalCount}
      onRefresh={() => {
        void refetch();
      }}
      onExport={onExport}
      exporting={exporting}
      tabs={
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="h-auto rounded-lg bg-muted p-1">
            {(
              [
                ["active", "tabActive"],
                ["pending", "tabPending"],
              ] as const
            ).map(([value, labelKey]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-md px-4 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {t(labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    />
  );
}
