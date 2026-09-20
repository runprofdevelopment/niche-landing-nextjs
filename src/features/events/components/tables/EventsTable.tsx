"use client";
"use no memo";

import { format, parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useEffect, useMemo } from "react";

import { routes } from "@/constants/routes";
import {
  buildEventListFilters,
  buildEventListSort,
} from "@/features/events/graphql/build-event-list-vars";
import { useEventListQuery } from "@/features/events/graphql/hooks/use-event-list";
import { useTranslations } from "@/hooks/useTranslations";
import { Link, useCurrentLocale } from "@/providers/i18n";
import {
  createAccessorColumn,
  createDisplayColumn,
  createSelectColumn,
  DataTableColumnHeader,
  DataTableView,
  dataTableFilterFns,
  useDataTable,
  useDataTableState,
} from "@/shared/components/table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTableExport } from "@/shared/hooks";

import { EventsTableRowActions } from "./EventsTableRowActions";

import type { EventRecord, EventStatus } from "../../types";
import type { DataTableFilterDef } from "@/shared/components/table";
import type { ColumnDef } from "@tanstack/react-table";

export type EventsTab = EventStatus;

export type EventTableRow = EventRecord;

const dateLocales = { en: enUS, ar } as const;

const SEARCH_COLUMNS = ["name", "brideName", "groomName", "hallReference"];

function parseEventDate(date: string): Date | null {
  if (!date) return null;
  try {
    return parseISO(date);
  } catch {
    return null;
  }
}

export function filterEventsByTab(events: EventRecord[], tab: EventsTab): EventRecord[] {
  return events.filter((event) => event.status === tab);
}

function formatEventTime(time: string, locale: string, emptyValue: string) {
  if (!time) return emptyValue;
  const parts = time.split(":").map(Number);
  const hours = parts[0];
  const minutes = parts[1];
  if (hours == null || minutes == null || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatEventDate(date: string, locale: string, emptyValue: string) {
  const parsed = parseEventDate(date);
  if (!parsed) return emptyValue;
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? enUS;
  return format(parsed, "MMM d, yyyy", { locale: dateLocale });
}

type EventsTableProps = {
  /** When provided, table runs client-side (e.g. dashboard). Omit for server `eventList`. */
  events?: EventRecord[];
  tab?: EventsTab;
  onTabChange?: (tab: EventsTab) => void;
  /** When set, filters by these statuses and hides status tabs. */
  statuses?: EventStatus[];
  showTabs?: boolean;
  onTotalCountChange?: (totalCount: number) => void;
};

export function EventsTable({
  events: clientEvents,
  tab = "live",
  onTabChange,
  statuses,
  showTabs = true,
  onTotalCountChange,
}: EventsTableProps) {
  const t = useTranslations("events");
  const tNav = useTranslations("navigation");
  const locale = useCurrentLocale();
  const controlledState = useDataTableState();
  const emptyValue = t("emptyValue");
  const serverMode = clientEvents == null;

  const filtersInput = useMemo(() => {
    const args: Parameters<typeof buildEventListFilters>[0] = {
      columnFilters: controlledState.state.columnFilters,
    };
    if (statuses && statuses.length > 0) {
      args.statuses = statuses;
    } else {
      args.tab = tab;
    }
    return buildEventListFilters(args);
  }, [controlledState.state.columnFilters, statuses, tab]);

  const sortInput = useMemo(
    () => buildEventListSort(controlledState.state.sorting),
    [controlledState.state.sorting],
  );

  const paginationInput = useMemo(
    () => ({
      limit: controlledState.state.pagination.pageSize,
      page: controlledState.state.pagination.pageIndex + 1,
    }),
    [controlledState.state.pagination.pageIndex, controlledState.state.pagination.pageSize],
  );

  const {
    events: serverEvents,
    totalCount,
    pageCount,
    loading: serverLoading,
    refetch,
  } = useEventListQuery({
    ...(sortInput ? { sort: sortInput } : {}),
    pagination: paginationInput,
    filters: filtersInput,
    skip: !serverMode,
  });

  useEffect(() => {
    if (!serverMode) return;
    onTotalCountChange?.(totalCount);
  }, [serverMode, onTotalCountChange, totalCount]);

  const data = useMemo(() => {
    if (serverMode) return serverEvents;
    if (statuses && statuses.length > 0) {
      return (clientEvents ?? []).filter((event) => statuses.includes(event.status));
    }
    return filterEventsByTab(clientEvents ?? [], tab);
  }, [clientEvents, serverEvents, serverMode, statuses, tab]);

  const hallRefOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((event) => event.hallReference)
            .filter((value): value is string => Boolean(value)),
        ),
      ).map((ref) => ({
        value: ref,
        label: ref,
      })),
    [data],
  );

  const filters = useMemo<DataTableFilterDef[]>(
    () => [
      {
        id: "hallReference",
        label: t("hallReference"),
        type: "multiSelect",
        options: hallRefOptions,
      },
      {
        id: "createdBy",
        label: t("filterCreatedBy"),
        type: "select",
        options: [
          { value: "App", label: t("createdByApp") },
          { value: "Operational", label: t("createdByOperational") },
        ],
      },
      {
        id: "date",
        label: t("filterDate"),
        type: "dateRange",
      },
    ],
    [t, hallRefOptions],
  );

  const columns = useMemo<ColumnDef<EventTableRow, unknown>[]>(
    () => [
      createSelectColumn<EventTableRow>(),
      createAccessorColumn<EventTableRow, string>("name", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnEvent")} />,
        cell: ({ row }) => (
          <Link
            href={routes.event(row.original.id)}
            className="font-semibold text-foreground hover:text-primary"
          >
            {row.original.name}
          </Link>
        ),
        meta: { label: t("columnEvent"), align: "start" },
      }),
      createAccessorColumn<EventTableRow, string>("brideName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnBrideName")} />
        ),
        meta: { label: t("columnBrideName"), align: "start" },
      }),
      createAccessorColumn<EventTableRow, string>("groomName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnGroomName")} />
        ),
        meta: { label: t("columnGroomName"), align: "start" },
      }),
      createAccessorColumn<EventTableRow, string>("customerName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnCustomerName")} />
        ),
        cell: ({ row }) =>
          row.original.customerName ? (
            <Link
              href={routes.event(row.original.id)}
              className="text-primary underline-offset-4 hover:underline"
            >
              {row.original.customerName}
            </Link>
          ) : (
            emptyValue
          ),
        enableColumnFilter: false,
        meta: { label: t("columnCustomerName"), align: "start" },
      }),
      createAccessorColumn<EventTableRow, EventTableRow["createdBy"]>("createdBy", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnCreatedBy")} />
        ),
        cell: ({ row }) =>
          row.original.createdBy === "App" ? t("createdByApp") : t("createdByOperational"),
        filterFn: "equals",
        meta: { label: t("columnCreatedBy"), align: "start" },
      }),
      createAccessorColumn<EventTableRow, string>("date", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnDate")} />,
        cell: ({ row }) => formatEventDate(row.original.date, locale, emptyValue),
        filterFn: dataTableFilterFns.dateRange,
        meta: { label: t("columnDate"), align: "start" },
      }),
      createAccessorColumn<EventTableRow, string>("startTime", {
        id: "time",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnTime")} />,
        cell: ({ row }) => formatEventTime(row.original.startTime, locale, emptyValue),
        enableColumnFilter: false,
        meta: { label: t("columnTime"), align: "start" },
      }),
      createAccessorColumn<EventTableRow, string | undefined>("hallReference", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("hallReference")} />
        ),
        cell: ({ row }) => row.original.hallReference || emptyValue,
        filterFn: dataTableFilterFns.multiSelect,
        meta: { label: t("hallReference"), align: "start" },
      }),
      createAccessorColumn<EventTableRow, number>("expectedGuests", {
        id: "guests",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnGuests")} />,
        enableColumnFilter: false,
        meta: { label: t("columnGuests"), align: "center" },
      }),
      createAccessorColumn<EventTableRow, number>("invitationCount", {
        id: "invitations",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnInvitations")} />
        ),
        enableColumnFilter: false,
        meta: { label: t("columnInvitations"), align: "center" },
      }),
      createDisplayColumn<EventTableRow>("actions", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnActions")} />
        ),
        cell: ({ row }) => <EventsTableRowActions event={row.original} />,
        enableHiding: false,
        enableSorting: false,
        size: 72,
        meta: { label: t("columnActions"), align: "end" },
      }),
    ],
    [emptyValue, locale, t],
  );

  const table = useDataTable<EventTableRow, unknown>({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState,
    ...(serverMode
      ? {
          manualPagination: true,
          manualFiltering: true,
          manualSorting: true,
          pageCount,
        }
      : {}),
  });

  const { exporting, onExport } = useTableExport(table, {
    collectionName: "events",
    fieldMap: {
      name: "name",
      brideName: "bride_name",
      groomName: "groom_name",
      customerName: "customer_name",
      date: "date",
      time: "time",
      hallReference: "hall_ref",
      expectedGuests: "expected_guests",
      invitationCount: "invitation_count",
    },
  });

  function handleTabChange(value: string) {
    const next = value as EventsTab;
    onTabChange?.(next);
    table.resetRowSelection();
    controlledState.onPaginationChange((previous) => ({ ...previous, pageIndex: 0 }));
  }

  return (
    <DataTableView
      table={table}
      caption={t("eventsTitle")}
      emptyMessage={t("noEventsInTab")}
      searchColumns={SEARCH_COLUMNS}
      filters={filters}
      loading={serverMode ? serverLoading : false}
      {...(serverMode ? { totalCount } : {})}
      onRefresh={() => {
        if (serverMode) void refetch();
      }}
      onExport={onExport}
      exporting={exporting}
      tabs={
        showTabs ? (
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="h-auto rounded-lg bg-muted p-1">
              {(
                [
                  ["live", "liveEvents"],
                  ["upcoming", "upcomingEvents"],
                  ["completed", "completedEvents"],
                ] as const
              ).map(([value, labelKey]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-md px-4 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  {tNav(labelKey)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : undefined
      }
    />
  );
}
