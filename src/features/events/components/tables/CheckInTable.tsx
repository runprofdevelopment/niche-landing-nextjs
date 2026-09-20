"use client";

import { LogIn, QrCode } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { useEventGuestListQuery, useEventGuestMutations } from "@/features/events/graphql";
import {
  buildEventGuestListFilters,
  buildEventGuestListSort,
} from "@/features/events/graphql/build-event-guest-list-vars";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { ConfirmDialog } from "@/shared/components/dialogs";
import { toast } from "@/shared/components/feedback/toast";
import {
  createAccessorColumn,
  createDisplayColumn,
  createSelectColumn,
  DataTableColumnHeader,
  DataTableToolbar,
  DataTableView,
  useDataTable,
  useDataTableState,
  TableRowActionsTrigger,
} from "@/shared/components/table";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { useTableExport } from "@/shared/hooks";

import { seatsForTable } from "../../domain/geometry";

import type { Guest, Hall } from "../../types";

type CheckInRow = Guest & {
  tableLabel: string;
  seatLabel: string;
  isCheckedIn: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type CheckInTableProps = {
  eventId: string;
  hall?: Hall;
};

export function CheckInTable({ eventId, hall }: CheckInTableProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const canCheckIn = can(EVENT_PERMISSIONS.checkIn);
  const controlledState = useDataTableState();
  const sortInput = useMemo(
    () => buildEventGuestListSort(controlledState.state.sorting),
    [controlledState.state.sorting],
  );
  const filtersInput = useMemo(
    () => buildEventGuestListFilters(controlledState.state.columnFilters),
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
    guests,
    totalCount,
    pageCount,
    loading: queryLoading,
    refetch,
  } = useEventGuestListQuery(eventId, {
    ...(sortInput ? { sort: sortInput } : {}),
    pagination: paginationInput,
    filters: filtersInput,
  });
  const { checkInGuest, checkingIn } = useEventGuestMutations(eventId);

  const [pendingCheckIn, setPendingCheckIn] = useState<CheckInRow | null>(null);

  const tableLabel = useCallback(
    (guest: Guest) => {
      if (guest.tableNumber) return guest.tableNumber;
      if (hall && guest.tableId) {
        const label = hall.layout.objects.find((object) => object.id === guest.tableId)?.label;
        if (label) return label;
      }
      return guest.tableId ?? "—";
    },
    [hall],
  );

  const seatLabel = useCallback(
    (guest: Guest) => {
      if (guest.seatNumber) return guest.seatNumber;
      if (hall && guest.tableId && guest.seatId) {
        const table = hall.layout.objects.find((object) => object.id === guest.tableId);
        if (table?.type === "table") {
          const seat = seatsForTable(table).find((entry) => entry.id === guest.seatId);
          if (seat) return String(seat.number);
        }
      }
      return guest.seatId ?? "—";
    },
    [hall],
  );

  const rows = useMemo<CheckInRow[]>(
    () =>
      guests.map((guest) => {
        const code = guest.code?.trim() || guest.qrCode?.name?.trim() || "";
        return {
          ...guest,
          ...(code ? { code } : {}),
          tableLabel: tableLabel(guest),
          seatLabel: seatLabel(guest),
          isCheckedIn: guest.checkedIn ?? (Boolean(guest.checkedInAt) && !guest.checkedOutAt),
        };
      }),
    [guests, seatLabel, tableLabel],
  );

  const confirmCheckIn = useCallback(async () => {
    if (!pendingCheckIn) return;
    const code = pendingCheckIn.code?.trim() || pendingCheckIn.qrCode?.name?.trim() || "";
    if (!code) {
      toast.error(t("checkInCodeMissing"));
      return;
    }
    try {
      await checkInGuest(code);
      toast.success(t("guestCheckedIn"));
      setPendingCheckIn(null);
      await refetch();
    } catch (error) {
      handleError(error, {
        context: {
          feature: "events",
          action: "EventGuestCheckIn",
          extra: { eventId, guestId: pendingCheckIn.id },
        },
        channels: ["toast"],
      });
      throw error;
    }
  }, [checkInGuest, eventId, handleError, pendingCheckIn, refetch, t]);

  const columns = useMemo(
    () => [
      createSelectColumn<CheckInRow>(),
      createAccessorColumn<CheckInRow, string>("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnGuestName")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
            </Avatar>
            <p className="truncate font-medium">{row.original.name}</p>
          </div>
        ),
        meta: { label: t("columnGuestName") },
      }),
      createAccessorColumn<CheckInRow, string | undefined>("email", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnEmail")} />,
        cell: ({ row }) => row.original.email ?? "—",
        meta: { label: t("columnEmail") },
      }),
      createAccessorColumn<CheckInRow, string | undefined>("phone", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnPhone")} />,
        cell: ({ row }) => row.original.phone ?? "—",
        meta: { label: t("columnPhone") },
      }),
      createAccessorColumn<CheckInRow, string | undefined>("abayaLabel", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnAbayaLabel")} />
        ),
        cell: ({ row }) =>
          row.original.abayaLabel ? (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {row.original.abayaLabel}
            </Badge>
          ) : (
            "—"
          ),
        meta: { label: t("columnAbayaLabel") },
      }),
      createAccessorColumn<CheckInRow, string>("tableLabel", {
        id: "table",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnTableNumber")} />
        ),
        cell: ({ row }) => row.original.tableLabel,
        meta: { label: t("columnTableNumber") },
      }),
      createAccessorColumn<CheckInRow, string>("seatLabel", {
        id: "seat",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnSeatNumber")} />
        ),
        cell: ({ row }) => row.original.seatLabel,
        meta: { label: t("columnSeatNumber") },
      }),
      createAccessorColumn<CheckInRow, boolean>("isCheckedIn", {
        id: "checkInStatus",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnGuestStatus")} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.isCheckedIn ? "success" : "inactive"} dot>
            {row.original.isCheckedIn ? t("statusArrived") : t("statusNotArrived")}
          </Badge>
        ),
        meta: { label: t("columnGuestStatus") },
      }),
      createDisplayColumn<CheckInRow>("actions", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnActions")} />
        ),
        cell: ({ row }) =>
          canCheckIn ? (
            <DropdownMenu>
              <TableRowActionsTrigger label={t("rowActionsLabel", { name: row.original.name })} />
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem
                  disabled={row.original.isCheckedIn || checkingIn}
                  onSelect={(event) => {
                    event.preventDefault();
                    setPendingCheckIn(row.original);
                  }}
                >
                  <LogIn className="size-4" />
                  {t("checkInUser")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null,
        enableHiding: false,
        enableSorting: false,
        size: 72,
        meta: { label: t("columnActions"), align: "end" },
      }),
    ],
    [canCheckIn, checkingIn, t],
  );

  const table = useDataTable<CheckInRow, unknown>({
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
    collectionName: "check-in",
    fieldMap: {
      name: "name",
      email: "email",
      phone: "phone",
      abayaLabel: "abaya_label",
    },
  });

  const checkInInfoRows = pendingCheckIn
    ? [
        { label: t("columnGuestName"), value: pendingCheckIn.name },
        ...(pendingCheckIn.email ? [{ label: t("columnEmail"), value: pendingCheckIn.email }] : []),
        ...(pendingCheckIn.phone ? [{ label: t("columnPhone"), value: pendingCheckIn.phone }] : []),
      ]
    : [];

  const qrPublicUrl = pendingCheckIn?.qrCode?.publicUrl?.trim() || "";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{t("checkInSystem")}</h2>
          <Badge variant="secondary" className="rounded-full px-2.5 tabular-nums">
            {t("guestsCount", { count: totalCount })}
          </Badge>
        </div>
        <Button asChild>
          <Link href={routes.eventCheckInScanner(eventId)}>
            <QrCode className="me-1 size-4" />
            {t("scannerButton")}
          </Link>
        </Button>
      </div>

      <DataTableView
        table={table}
        caption={t("checkInSystem")}
        emptyMessage={queryLoading && guests.length === 0 ? t("loadingEvent") : t("noMembersYet")}
        searchColumns={["name", "email", "phone", "abayaLabel"]}
        loading={queryLoading}
        toolbar={
          <DataTableToolbar
            table={table}
            searchColumns={["name", "email", "phone"]}
            showColumnVisibility
            filters={[]}
            onRefresh={() => {
              void refetch();
            }}
            refreshing={queryLoading}
            onExport={onExport}
            exporting={exporting}
          />
        }
      />

      <ConfirmDialog
        open={Boolean(pendingCheckIn)}
        onOpenChange={(open) => {
          if (!open) setPendingCheckIn(null);
        }}
        tone="success"
        title={t("confirmCheckInTitle", { name: pendingCheckIn?.name ?? "" })}
        description={t("confirmCheckInDescription")}
        infoRows={checkInInfoRows}
        cancelLabel={t("cancel")}
        confirmLabel={t("checkInUser")}
        loading={checkingIn}
        onConfirm={confirmCheckIn}
      >
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-border bg-muted/30 p-4">
          {qrPublicUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Firebase QR URL
            <img
              src={qrPublicUrl}
              alt={t("viewQrCodeTitle")}
              className="max-h-52 max-w-full object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("qrUnavailable")}</p>
          )}
        </div>
      </ConfirmDialog>
    </section>
  );
}
