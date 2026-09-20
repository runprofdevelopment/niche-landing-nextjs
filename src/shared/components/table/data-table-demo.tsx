"use client";
"use no memo";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { Tabs, TabsList, TabsTab } from "../navigation/tabs";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";

import { createAccessorColumn, createSelectColumn } from "./columns";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableView } from "./data-table-view";
import { dataTableFilterFns } from "./filters";
import { useDataTable, useDataTableState, useDataTableUrlState } from "./hooks";

import type { DataTableControlledState, DataTableFilterDef } from "./types";
import type { ColumnDef } from "@tanstack/react-table";

type DemoBooking = {
  id: string;
  guest: string;
  property: string;
  status: "confirmed" | "pending" | "cancelled";
  nights: number;
  checkIn: Date;
  vip: boolean;
  channel: "direct" | "airbnb" | "bookingCom";
};

const CHANNEL_OPTIONS = [
  { value: "direct", label: "Direct" },
  { value: "airbnb", label: "Airbnb" },
  { value: "bookingCom", label: "Booking.com" },
];

const RAW_BOOKINGS: Omit<DemoBooking, "channel">[] = [
  {
    id: "b-1001",
    guest: "Amira Hassan",
    property: "Marina Loft 4B",
    status: "confirmed",
    nights: 3,
    checkIn: new Date("2026-07-10"),
    vip: true,
  },
  {
    id: "b-1002",
    guest: "Omar Khalil",
    property: "Old Town Studio",
    status: "pending",
    nights: 5,
    checkIn: new Date("2026-07-14"),
    vip: false,
  },
  {
    id: "b-1003",
    guest: "Sara Menon",
    property: "Palm Villa",
    status: "confirmed",
    nights: 7,
    checkIn: new Date("2026-07-18"),
    vip: true,
  },
  {
    id: "b-1004",
    guest: "James Wright",
    property: "Downtown Suite",
    status: "cancelled",
    nights: 2,
    checkIn: new Date("2026-07-05"),
    vip: false,
  },
  {
    id: "b-1005",
    guest: "Lina Farouk",
    property: "Garden Apartment",
    status: "pending",
    nights: 4,
    checkIn: new Date("2026-07-22"),
    vip: false,
  },
  {
    id: "b-1006",
    guest: "Noah Ibrahim",
    property: "Harbor View",
    status: "confirmed",
    nights: 6,
    checkIn: new Date("2026-07-09"),
    vip: true,
  },
  {
    id: "b-1007",
    guest: "Maya Chen",
    property: "Skyline Penthouse",
    status: "confirmed",
    nights: 2,
    checkIn: new Date("2026-08-01"),
    vip: true,
  },
  {
    id: "b-1008",
    guest: "Youssef Ali",
    property: "Creek Residence",
    status: "pending",
    nights: 8,
    checkIn: new Date("2026-07-27"),
    vip: false,
  },
  {
    id: "b-1009",
    guest: "Elena Rossi",
    property: "Beach Chalet",
    status: "confirmed",
    nights: 3,
    checkIn: new Date("2026-07-12"),
    vip: false,
  },
  {
    id: "b-1010",
    guest: "David Park",
    property: "City Walk Flat",
    status: "cancelled",
    nights: 1,
    checkIn: new Date("2026-07-03"),
    vip: false,
  },
  {
    id: "b-1011",
    guest: "Fatima Noor",
    property: "Lagoon House",
    status: "confirmed",
    nights: 9,
    checkIn: new Date("2026-08-05"),
    vip: true,
  },
  {
    id: "b-1012",
    guest: "Chris Miller",
    property: "Hillside Duplex",
    status: "pending",
    nights: 4,
    checkIn: new Date("2026-07-30"),
    vip: false,
  },
];

const DEMO_BOOKINGS: DemoBooking[] = RAW_BOOKINGS.map((booking, index) => ({
  ...booking,
  channel: CHANNEL_OPTIONS[index % CHANNEL_OPTIONS.length]!.value as DemoBooking["channel"],
}));

const PROPERTY_OPTIONS = Array.from(new Set(DEMO_BOOKINGS.map((booking) => booking.property))).map(
  (property) => ({ value: property, label: property }),
);

const statusVariant: Record<DemoBooking["status"], "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  pending: "secondary",
  cancelled: "destructive",
};

const DEMO_FILTERS: DataTableFilterDef[] = [
  { id: "channel", label: "Channel", type: "select", options: CHANNEL_OPTIONS },
  {
    id: "property",
    label: "Property",
    type: "multiSelect",
    options: PROPERTY_OPTIONS,
  },
  { id: "checkIn", label: "Check-in", type: "dateRange" },
  { id: "vip", label: "VIP guest", type: "switch" },
];

function useDemoColumns(): ColumnDef<DemoBooking, unknown>[] {
  return useMemo<ColumnDef<DemoBooking, unknown>[]>(
    () => [
      createSelectColumn<DemoBooking>(),
      createAccessorColumn<DemoBooking, string>("guest", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Guest" />,
        cell: ({ row }) => <span className="font-medium">{row.original.guest}</span>,
        meta: { label: "Guest", align: "start" },
      }),
      createAccessorColumn<DemoBooking, string>("property", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Property" />,
        cell: ({ row }) => row.original.property,
        filterFn: dataTableFilterFns.multiSelect,
        meta: { label: "Property" },
      }),
      createAccessorColumn<DemoBooking, DemoBooking["channel"]>("channel", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Channel" />,
        cell: ({ row }) =>
          CHANNEL_OPTIONS.find((option) => option.value === row.original.channel)?.label,
        filterFn: "equals",
        meta: { label: "Channel" },
      }),
      createAccessorColumn<DemoBooking, DemoBooking["status"]>("status", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
        ),
        filterFn: "equals",
        meta: { label: "Status" },
      }),
      createAccessorColumn<DemoBooking, Date>("checkIn", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Check-in" />,
        cell: ({ row }) => row.original.checkIn.toLocaleDateString(),
        filterFn: dataTableFilterFns.dateRange,
        meta: { label: "Check-in" },
      }),
      createAccessorColumn<DemoBooking, number>("nights", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nights" />,
        cell: ({ row }) => row.original.nights,
        enableColumnFilter: false,
        meta: { label: "Nights" },
      }),
      createAccessorColumn<DemoBooking, boolean>("vip", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="VIP" />,
        cell: ({ row }) => (row.original.vip ? <Badge variant="secondary">VIP</Badge> : null),
        filterFn: "equals",
        meta: { label: "VIP guest" },
      }),
    ],
    [],
  );
}

/**
 * Simulates a network refetch so the loading overlay has something to show —
 * both for the manual refresh button and, in a real app, for whatever
 * triggers a server round-trip (search, sort, filter, page change). Here
 * that's simulated by pulsing on any change to that slice of table state;
 * in production, wire `loading` to your data hook's `isFetching` instead.
 */
function useSimulatedRefresh(stateSignature: string) {
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  function refresh() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 700);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLoading(true);
    const timeout = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timeout);
  }, [stateSignature]);

  return { loading, refresh };
}

const STATUS_TABS = ["all", "confirmed", "pending", "cancelled"] as const;

function DataTableDemoInner({ controlledState }: { controlledState: DataTableControlledState }) {
  const columns = useDemoColumns();
  const { sorting, columnFilters, globalFilter, pagination } = controlledState.state;
  const stateSignature = JSON.stringify({
    sorting,
    columnFilters,
    globalFilter,
    pagination,
  });
  const { loading, refresh } = useSimulatedRefresh(stateSignature);
  const [statusTab, setStatusTab] = useState<(typeof STATUS_TABS)[number]>("all");

  const table = useDataTable<DemoBooking, unknown>({
    data: DEMO_BOOKINGS,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState,
  });

  const statusColumn = table.getColumn("status");
  function handleStatusTabChange(value: string) {
    const next = value as (typeof STATUS_TABS)[number];
    setStatusTab(next);
    statusColumn?.setFilterValue(next === "all" ? undefined : next);
  }

  return (
    <DataTableView
      table={table}
      caption="Bookings data table demo"
      emptyMessage="No bookings match your filters."
      searchColumns={["guest", "status"]}
      filters={DEMO_FILTERS}
      loading={loading}
      onRefresh={refresh}
      tabs={
        <Tabs value={statusTab} onValueChange={(value) => handleStatusTabChange(String(value))}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTab key={tab} value={tab} className="capitalize text-foreground">
                {tab}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      }
    />
  );
}

function DataTableLocalDemo() {
  const controlledState = useDataTableState();
  return <DataTableDemoInner controlledState={controlledState} />;
}

function DataTableUrlDemoInner() {
  const controlledState = useDataTableUrlState();
  return <DataTableDemoInner controlledState={controlledState} />;
}

function DataTableUrlDemo() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center rounded-xl border border-border">
          <Spinner />
        </div>
      }
    >
      <DataTableUrlDemoInner />
    </Suspense>
  );
}

type DataTableDemoTabsProps = {
  className?: string;
};

function DataTableDemoTabs({ className }: DataTableDemoTabsProps) {
  const [mode, setMode] = useState<"local" | "url">("local");

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("local")}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            mode === "local"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          Local state
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            mode === "url"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          URL-synced state
        </button>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {mode === "local"
          ? "State is owned by React via useDataTableState — ideal for modals and wizards. This variant also shows the optional status tabs row."
          : "State is mirrored to query params via useDataTableUrlState — sort, filter, and paginate, then share or refresh the URL. This variant has no tabs, showing the row is fully optional."}
      </p>

      {mode === "local" ? <DataTableLocalDemo /> : <DataTableUrlDemo />}
    </div>
  );
}

export { DataTableDemoTabs, DataTableLocalDemo, DataTableUrlDemo };
