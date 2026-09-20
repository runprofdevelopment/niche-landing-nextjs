"use client";
"use no memo";

import { useEffect, useMemo } from "react";

import { useEventTypeEnumQuery } from "@/features/events/graphql";
import {
  buildContactUsListFilters,
  buildContactUsListSort,
  useContactUsListQuery,
} from "@/features/requests/graphql";
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
import { useTableExport } from "@/shared/hooks";

import { CONTACT_US_STATUS_BADGE_VARIANT, CONTACT_US_STATUS_LABEL_KEYS } from "../../constants";

import { RequestsTableRowActions } from "./RequestsTableRowActions";

import type { ContactUsRequest, ContactUsStatus } from "../../types";
import type { DataTableFilterDef } from "@/shared/components/table";
import type { ColumnDef } from "@tanstack/react-table";

const SEARCH_COLUMNS = ["customerName", "phoneNumber", "email"];

type RequestsTableProps = {
  onTotalCountChange?: (totalCount: number) => void;
};

export function RequestsTable({ onTotalCountChange }: RequestsTableProps) {
  const t = useTranslations("requests");
  const controlledState = useDataTableState();
  const emptyValue = t("emptyValue");
  const { options: eventTypeOptions } = useEventTypeEnumQuery();

  const filtersInput = useMemo(
    () =>
      buildContactUsListFilters({
        columnFilters: controlledState.state.columnFilters,
      }),
    [controlledState.state.columnFilters],
  );

  const sortInput = useMemo(
    () => buildContactUsListSort(controlledState.state.sorting),
    [controlledState.state.sorting],
  );

  const paginationInput = useMemo(
    () => ({
      limit: controlledState.state.pagination.pageSize,
      page: controlledState.state.pagination.pageIndex + 1,
    }),
    [controlledState.state.pagination.pageIndex, controlledState.state.pagination.pageSize],
  );

  const { requests, totalCount, pageCount, loading, refetch } = useContactUsListQuery({
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
        pending: t(CONTACT_US_STATUS_LABEL_KEYS.pending),
        resolved: t(CONTACT_US_STATUS_LABEL_KEYS.resolved),
      }) satisfies Record<ContactUsStatus, string>,
    [t],
  );

  const eventTypeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of eventTypeOptions) {
      map.set(option.value, option.label);
    }
    return map;
  }, [eventTypeOptions]);

  const filters = useMemo<DataTableFilterDef[]>(
    () => [
      {
        id: "status",
        label: t("filterStatus"),
        type: "select",
        options: [
          { value: "pending", label: t("statusPending") },
          { value: "resolved", label: t("statusResolved") },
        ],
      },
      {
        id: "eventType",
        label: t("filterEventType"),
        type: "select",
        options: eventTypeOptions,
      },
      {
        id: "createdAt",
        label: t("filterCreatedAt"),
        type: "dateRange",
      },
    ],
    [eventTypeOptions, t],
  );

  const columns = useMemo<ColumnDef<ContactUsRequest, unknown>[]>(
    () => [
      createSelectColumn<ContactUsRequest>(),
      createAccessorColumn<ContactUsRequest, string>("customerName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnCustomerName")} />
        ),
        cell: ({ getValue }) => getValue() || emptyValue,
        meta: { label: t("columnCustomerName"), align: "start" },
      }),
      createAccessorColumn<ContactUsRequest, string>("phoneNumber", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnPhone")} />,
        cell: ({ getValue }) => getValue() || emptyValue,
        meta: { label: t("columnPhone"), align: "start" },
      }),
      createAccessorColumn<ContactUsRequest, string>("email", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnEmail")} />,
        cell: ({ getValue }) => getValue() || emptyValue,
        meta: { label: t("columnEmail"), align: "start" },
      }),
      createAccessorColumn<ContactUsRequest, string>("eventType", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnEventType")} />
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return emptyValue;
          const label = eventTypeLabelById.get(value) ?? value;
          return (
            <Badge variant="secondary" className="capitalize">
              {label}
            </Badge>
          );
        },
        meta: { label: t("columnEventType"), align: "start" },
      }),
      createAccessorColumn<ContactUsRequest, string>("date", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnDate")} />,
        cell: ({ row }) => {
          const date = row.original.date || emptyValue;
          const time = row.original.time;
          return time ? `${date} · ${time}` : date;
        },
        meta: { label: t("columnDate"), align: "start" },
      }),
      createAccessorColumn<ContactUsRequest, ContactUsStatus>("status", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnStatus")} />,
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <Badge variant={CONTACT_US_STATUS_BADGE_VARIANT[status]} dot>
              {statusLabel[status]}
            </Badge>
          );
        },
        meta: { label: t("columnStatus"), align: "center" },
      }),
      createAccessorColumn<ContactUsRequest, string>("createdAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnCreatedAt")} />
        ),
        cell: ({ getValue }) => getValue() || emptyValue,
        meta: { label: t("columnCreatedAt"), align: "start" },
      }),
      createDisplayColumn<ContactUsRequest>("actions", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnActions")} />
        ),
        cell: ({ row }) => <RequestsTableRowActions request={row.original} />,
        enableHiding: false,
        enableSorting: false,
        size: 72,
        meta: { label: t("columnActions"), align: "end" },
      }),
    ],
    [emptyValue, eventTypeLabelById, statusLabel, t],
  );

  const table = useDataTable<ContactUsRequest, unknown>({
    data: requests,
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
    collectionName: "contact-us-requests",
    fieldMap: {
      customerName: "customerName",
      phoneNumber: "phoneNumber",
      email: "email",
      eventType: "eventType",
      date: "date",
      time: "time",
      status: "status",
      createdAt: "createdAt",
    },
  });

  return (
    <DataTableView
      table={table}
      caption={t("listTitle")}
      emptyMessage={t("noRequests")}
      searchColumns={SEARCH_COLUMNS}
      filters={filters}
      loading={loading}
      totalCount={totalCount}
      fillHeight
      onRefresh={() => {
        void refetch();
      }}
      onExport={onExport}
      exporting={exporting}
    />
  );
}
