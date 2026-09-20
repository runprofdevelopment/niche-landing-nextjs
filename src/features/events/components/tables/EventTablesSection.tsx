"use client";

import { useMemo } from "react";

import {
  buildEventTablesListFilters,
  buildEventTablesListSort,
} from "@/features/events/graphql/build-event-tables-list-vars";
import { useEventTablesListQuery } from "@/features/events/graphql/hooks/use-event-tables";
import { useTranslations } from "@/hooks/useTranslations";
import {
  createAccessorColumn,
  createDisplayColumn,
  createSelectColumn,
  DataTableColumnHeader,
  DataTableToolbar,
  DataTableView,
  useDataTable,
  useDataTableState,
  type DataTableFilterDef,
} from "@/shared/components/table";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { useTableExport } from "@/shared/hooks";

import { EventTablesRowActions } from "./EventTablesRowActions";

import type { EventTableSummary } from "../../domain/event-tables";

type EventTableRowData = EventTableSummary & {
  guestsLabel: string;
};

type EventTablesSectionProps = {
  eventId: string;
};

export function EventTablesSection({ eventId }: EventTablesSectionProps) {
  const t = useTranslations("events");

  const controlledState = useDataTableState();

  const sortInput = useMemo(
    () => buildEventTablesListSort(controlledState.state.sorting),
    [controlledState.state.sorting],
  );
  const filtersInput = useMemo(
    () => buildEventTablesListFilters(controlledState.state.columnFilters),
    [controlledState.state.columnFilters],
  );
  const paginationInput = useMemo(
    () => ({
      limit: controlledState.state.pagination.pageSize,
      page: controlledState.state.pagination.pageIndex + 1,
    }),
    [controlledState.state.pagination.pageIndex, controlledState.state.pagination.pageSize],
  );

  const {
    rows: tables,
    totalCount,
    pageCount,
    loading,
  } = useEventTablesListQuery(eventId, {
    ...(sortInput ? { sort: sortInput } : {}),
    pagination: paginationInput,
    filters: filtersInput,
  });

  const rows = useMemo<EventTableRowData[]>(
    () =>
      tables.map((table) => ({
        ...table,
        guestsLabel: table.guests.map((guest) => guest.name).join(", "),
      })),
    [tables],
  );

  const filters = useMemo<DataTableFilterDef[]>(
    () => [
      {
        id: "capacity",
        label: t("capacity"),
        type: "input",
        inputType: "number",
        placeholder: t("capacity"),
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      createSelectColumn<EventTableRowData>(),
      createAccessorColumn<EventTableRowData, string>("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnTableName")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{row.original.code}</AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{row.original.name}</span>
          </div>
        ),
        meta: { label: t("columnTableName") },
      }),
      createAccessorColumn<EventTableRowData, number>("capacity", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("capacity")} />,
        cell: ({ row }) => t("capacitySeats", { count: row.original.capacity }),
        meta: { label: t("capacity") },
      }),
      createAccessorColumn<EventTableRowData, string>("guestsLabel", {
        id: "guests",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnAssignedGuests")} />
        ),
        cell: ({ row }) =>
          row.original.guests.length === 0 ? (
            <span className="text-muted-foreground italic">{t("noGuestsAssigned")}</span>
          ) : (
            <div className="flex flex-col">
              {row.original.guests.map((guest) => (
                <span key={guest.id} className="truncate">
                  {guest.name}
                </span>
              ))}
            </div>
          ),
        enableSorting: false,
        meta: { label: t("columnAssignedGuests") },
      }),
      createDisplayColumn<EventTableRowData>("actions", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnActions")} />
        ),
        cell: ({ row }) => <EventTablesRowActions table={row.original} />,
        enableHiding: false,
        enableSorting: false,
        size: 72,
        meta: { label: t("columnActions"), align: "end" },
      }),
    ],
    [t],
  );

  const table = useDataTable<EventTableRowData, unknown>({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    controlledState,
  });

  const { exporting, onExport } = useTableExport(table, {
    collectionName: "event-tables",
    fieldMap: {
      name: "table_name",
      capacity: "capacity",
      guestsLabel: "assigned_guests",
      code: "table_code",
    },
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-2xl font-semibold">{t("eventTables")}</h2>
        <Badge variant="secondary" className="rounded-full px-2.5 tabular-nums">
          {totalCount}
        </Badge>
      </div>

      <DataTableView
        table={table}
        caption={t("eventTables")}
        emptyMessage={t("noTablesYet")}
        searchColumns={["name"]}
        loading={loading}
        toolbar={
          <DataTableToolbar
            table={table}
            searchColumns={["name"]}
            showColumnVisibility
            filters={filters}
            onExport={onExport}
            exporting={exporting}
          />
        }
      />
    </section>
  );
}
