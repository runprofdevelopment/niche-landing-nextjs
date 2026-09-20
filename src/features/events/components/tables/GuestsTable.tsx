"use client";

import { Plus, Upload } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { GUEST_PERMISSIONS, INVITATION_PERMISSIONS } from "@/constants/permissions";
import {
  useEventGuestListQuery,
  useEventGuestMutations,
  useGuestMutations,
} from "@/features/events/graphql";
import {
  buildEventGuestListFilters,
  buildEventGuestListSort,
} from "@/features/events/graphql/build-event-guest-list-vars";
import { useEventInvitationShareMutation } from "@/features/invitations/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { BulkImportDialog } from "@/shared/components/dialogs";
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
} from "@/shared/components/table";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useBulkImport, useTableExport } from "@/shared/hooks";
import { bulkImportRest, downloadBulkImportTemplate } from "@/shared/utils";

import { seatsForTable } from "../../domain/geometry";
import { GuestFormDialog } from "../dialogs";

import { GuestsTableRowActions } from "./GuestsTableRowActions";

import type { GuestDetailsFormValues } from "../../schemas/event-forms.schema";
import type { Guest, GuestGender, GuestStatus, Hall } from "../../types";
import type { DataTableFilterDef } from "@/shared/components/table";

type GuestTableRow = Guest & {
  companionsCount: number;
  tableLabel: string;
  seatLabel: string;
};

type ParsedImportRow = {
  name: string;
  familyName: string;
  email: string;
  phone: string;
  gender: GuestGender;
  code: string;
  abayaLabel?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function nextGuestCode(guests: Guest[]) {
  const max = guests.reduce((highest, guest) => {
    const match = guest.code?.match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `Guest-${String(max + 1).padStart(3, "0")}`;
}

function nextAbayaLabel(guests: Guest[], gender: GuestGender) {
  if (gender !== "female") return undefined;
  const max = guests.reduce((highest, guest) => {
    const match = guest.abayaLabel?.match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `ABY-${String(max + 1).padStart(3, "0")}`;
}

function statusVariant(status: GuestStatus | undefined) {
  if (status === "confirmed") return "success" as const;
  if (status === "cancelled") return "destructive" as const;
  return "warning" as const;
}

function recordValue(record: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const match = Object.entries(record).find(
      ([header]) => header.trim().toLowerCase() === key.toLowerCase(),
    );
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
}

type GuestsTableProps = {
  eventId: string;
  hall?: Hall;
};

export function GuestsTable({ eventId, hall }: GuestsTableProps) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const { handleError } = useErrorHandler();
  const { can } = usePermissions();
  const canCreateGuest = can(GUEST_PERMISSIONS.create);
  const canUpdateGuest = can(GUEST_PERMISSIONS.update);
  const canDeleteGuest = can(GUEST_PERMISSIONS.delete);
  const canShareInvitation = can(INVITATION_PERMISSIONS.share);
  const controlledState = useDataTableState({
    columnVisibility: { id: false, gender: false, createdAt: false },
  });
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
  const { createGuest, updateGuest, destroyGuest } = useEventGuestMutations(eventId);
  const { bulkImportGuests } = useGuestMutations(eventId);
  const { shareEventInvitation } = useEventInvitationShareMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [resendingGuestId, setResendingGuestId] = useState<string | null>(null);

  const tableLabel = useCallback(
    (guest: Guest) => {
      if (guest.tableNumber) return guest.tableNumber;
      if (!guest.tableId || !hall) return "—";
      return hall.layout.objects.find((object) => object.id === guest.tableId)?.label ?? "—";
    },
    [hall],
  );

  const seatLabel = useCallback(
    (guest: Guest) => {
      if (guest.seatNumber) return guest.seatNumber;
      if (hall && guest.tableId && guest.seatId) {
        const table = hall.layout.objects.find((object) => object.id === guest.tableId);
        if (table) {
          const seat = seatsForTable(table).find((entry) => entry.id === guest.seatId);
          if (seat) return String(seat.number);
        }
      }
      return guest.seatId ?? "—";
    },
    [hall],
  );

  const rows = useMemo<GuestTableRow[]>(
    () =>
      guests.map((guest) => ({
        ...guest,
        companionsCount: guest.numberOfCompanions ?? 0,
        tableLabel: tableLabel(guest),
        seatLabel: seatLabel(guest),
      })),
    [guests, seatLabel, tableLabel],
  );

  const handleAdd = async (values: GuestDetailsFormValues) => {
    try {
      await createGuest(values);
      toast.success(t("guestAdded"));
    } catch (error) {
      handleError(error, { context: { feature: "events", action: "createGuest" } });
      throw error;
    }
  };

  const handleUpdate = useCallback(
    async (guestId: string, values: GuestDetailsFormValues) => {
      try {
        await updateGuest(guestId, values);
        toast.success(t("guestUpdated"));
      } catch (error) {
        handleError(error, { context: { feature: "events", action: "updateGuest" } });
        throw error;
      }
    },
    [handleError, t, updateGuest],
  );

  const handleDelete = useCallback(
    async (guestId: string) => {
      try {
        await destroyGuest(guestId);
        toast.success(t("guestDeleted"));
      } catch (error) {
        handleError(error, { context: { feature: "events", action: "deleteGuest" } });
        throw error;
      }
    },
    [destroyGuest, handleError, t],
  );

  const handleResendInvitation = useCallback(
    async (guest: Guest) => {
      if (resendingGuestId) return;
      setResendingGuestId(guest.id);
      try {
        await shareEventInvitation(eventId, [guest.id]);
        toast.success(t("invitationResent", { name: guest.name || guest.phone || guest.id }));
      } catch (error) {
        handleError(error, {
          context: {
            feature: "invitations",
            action: "EventInvitationShare",
            extra: { eventId, guestId: guest.id },
          },
          channels: ["toast"],
        });
      } finally {
        setResendingGuestId(null);
      }
    },
    [eventId, handleError, resendingGuestId, shareEventInvitation, t],
  );

  const downloadTemplateFn = useCallback(
    () =>
      downloadBulkImportTemplate("events/guests", {
        columns: ["Name", "Family Name", "Email", "Phone Number", "Gender"],
        sampleRow: ["Sara Al-Farid", "Al-Farid", "sara@example.com", "+966501234567", "female"],
      }),
    [],
  );

  const importFn = useCallback(
    async (file: File, options: { onProgress: (progress: number) => void }) => {
      const working = [...guests];
      const parsed = await bulkImportRest<ParsedImportRow>(
        "events/guests",
        file,
        (record) => {
          const name = recordValue(record, "Name");
          const familyName = recordValue(record, "Family Name", "Family");
          const email = recordValue(record, "Email");
          const phone = recordValue(record, "Phone Number", "Phone");
          const genderRaw = recordValue(record, "Gender");
          if (!name || !familyName || !email || !phone) {
            throw new Error("Name, Family Name, Email, and Phone are required");
          }
          const gender: GuestGender = genderRaw.toLowerCase().startsWith("f") ? "female" : "male";
          const code = nextGuestCode(working);
          const abayaLabel = nextAbayaLabel(working, gender);
          const row: ParsedImportRow = {
            name,
            familyName,
            email,
            phone,
            gender,
            code,
            ...(abayaLabel ? { abayaLabel } : {}),
          };
          working.push({ id: `preview-${working.length}`, eventId, ...row });
          return row;
        },
        {
          onProgress: (progress) => options.onProgress(Math.min(60, progress * 0.6)),
        },
      );

      if (parsed.rows.length === 0) {
        return {
          message: parsed.message,
          importedCount: 0,
          errors: parsed.errors,
          rows: [] as Guest[],
        };
      }

      options.onProgress(70);
      const result = await bulkImportGuests(
        parsed.rows.map((row) => ({
          name: row.name,
          familyName: row.familyName,
          email: row.email,
          phone: row.phone,
          gender: row.gender,
          code: row.code,
          rsvpStatus: "unconfirmed" as const,
          ...(row.abayaLabel ? { abayaLabel: row.abayaLabel } : {}),
        })),
      );
      options.onProgress(100);

      return {
        message: result.message || parsed.message,
        importedCount: result.importedCount,
        errors: [...parsed.errors, ...result.errors],
        rows: result.guests,
      };
    },
    [bulkImportGuests, eventId, guests],
  );

  const bulkImport = useBulkImport<Guest>({
    downloadTemplateFn,
    fallbackTemplateFileName: t("bulkImportTemplateName"),
    fallbackTemplateMeta: t("bulkImportTemplateMeta"),
    importFn,
    handleError,
    errorContext: { feature: "events", action: "bulkImportGuests" },
    successMessage: tCommon("importSuccessMessage"),
    formatUploadedMeta: ({ count, size }) => t("bulkImportUploadedMeta", { count, size }),
  });

  const filters = useMemo<DataTableFilterDef[]>(
    () => [
      {
        id: "status",
        label: t("filterStatus"),
        type: "select",
        options: [
          { value: "expected", label: t("statusExpected") },
          { value: "confirmed", label: t("statusConfirmed") },
          { value: "cancelled", label: t("statusCancelled") },
        ],
      },
      {
        id: "gender",
        label: t("filterGender"),
        type: "select",
        options: [
          { value: "male", label: t("genderMale") },
          { value: "female", label: t("genderFemale") },
          { value: "NA", label: t("genderNA") },
        ],
      },
      {
        id: "createdAt",
        label: t("filterCreatedAt"),
        type: "dateRange",
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      createSelectColumn<GuestTableRow>(),
      createAccessorColumn<GuestTableRow, string>("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnGuestName")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{initials(row.original.name || "—")}</AvatarFallback>
            </Avatar>
            <p className="truncate font-medium">{row.original.name || "—"}</p>
          </div>
        ),
        meta: { label: t("columnGuestName") },
      }),
      createAccessorColumn<GuestTableRow, number>("companionsCount", {
        id: "companions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnCompanions")} />
        ),
        cell: ({ row }) => row.original.numberOfCompanions ?? row.original.companionsCount,
        meta: { label: t("columnCompanions") },
      }),
      createAccessorColumn<GuestTableRow, string | undefined>("email", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnEmail")} />,
        cell: ({ row }) => row.original.email ?? "—",
        meta: { label: t("columnEmail") },
      }),
      createAccessorColumn<GuestTableRow, string | undefined>("phone", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnPhone")} />,
        cell: ({ row }) => row.original.phone ?? "—",
        meta: { label: t("columnPhone") },
      }),
      createAccessorColumn<GuestTableRow, string>("tableLabel", {
        id: "table",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnTableNumber")} />
        ),
        cell: ({ row }) => row.original.tableLabel,
        enableSorting: false,
        enableColumnFilter: false,
        meta: { label: t("columnTableNumber") },
      }),
      createAccessorColumn<GuestTableRow, string>("seatLabel", {
        id: "seat",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnSeatNumber")} />
        ),
        cell: ({ row }) => row.original.seatLabel,
        enableSorting: false,
        enableColumnFilter: false,
        meta: { label: t("columnSeatNumber") },
      }),
      createAccessorColumn<GuestTableRow, GuestStatus | undefined>("status", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnGuestStatus")} />
        ),
        cell: ({ row }) => {
          const status = row.original.status ?? "expected";
          return (
            <Badge variant={statusVariant(status)} dot>
              {status === "confirmed"
                ? t("statusConfirmed")
                : status === "cancelled"
                  ? t("statusCancelled")
                  : t("statusExpected")}
            </Badge>
          );
        },
        enableColumnFilter: false,
        meta: { label: t("columnGuestStatus") },
      }),
      createAccessorColumn<GuestTableRow, string>("id", {
        header: t("filterGuestId"),
        enableHiding: false,
        enableSorting: false,
        size: 0,
        meta: { label: t("filterGuestId") },
      }),
      createAccessorColumn<GuestTableRow, GuestGender | undefined>("gender", {
        header: t("filterGender"),
        enableHiding: false,
        enableSorting: false,
        size: 0,
        meta: { label: t("filterGender") },
      }),
      createAccessorColumn<GuestTableRow, string>("createdAt", {
        header: t("filterCreatedAt"),
        enableHiding: false,
        enableSorting: false,
        size: 0,
        meta: { label: t("filterCreatedAt") },
      }),
      createDisplayColumn<GuestTableRow>("actions", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnActions")} />
        ),
        cell: ({ row }) => (
          <GuestsTableRowActions
            guest={row.original}
            tableLabel={row.original.tableLabel}
            seatLabel={row.original.seatLabel}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onResendInvitation={handleResendInvitation}
            canUpdate={canUpdateGuest}
            canDelete={canDeleteGuest}
            canShareInvitation={canShareInvitation}
            resending={resendingGuestId === row.original.id}
          />
        ),
        enableHiding: false,
        enableSorting: false,
        size: 72,
        meta: { label: t("columnActions"), align: "end" },
      }),
    ],
    [
      canDeleteGuest,
      canShareInvitation,
      canUpdateGuest,
      handleDelete,
      handleResendInvitation,
      handleUpdate,
      resendingGuestId,
      t,
    ],
  );

  const table = useDataTable<GuestTableRow, unknown>({
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
    collectionName: "guests",
    fieldMap: {
      name: "name",
      email: "email",
      phone: "phone",
      status: "status",
      companionsCount: "companions",
      tableLabel: "table",
      seatLabel: "seat",
    },
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{t("guestListCount")}</h2>
          <Badge variant="secondary" className="rounded-full px-2.5 tabular-nums">
            {totalCount}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreateGuest ? (
            <Button
              variant="outline-invert"
              className="border-primary text-primary"
              onClick={bulkImport.openDialog}
            >
              <Upload className="size-4" />
              {t("bulkImport")}
            </Button>
          ) : null}
          {canCreateGuest ? (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              {t("addGuest")}
            </Button>
          ) : null}
        </div>
      </div>

      <DataTableView
        table={table}
        caption={t("guestList")}
        emptyMessage={t("noMembersYet")}
        searchColumns={["name", "email", "phone", "id"]}
        filters={filters}
        loading={queryLoading}
        totalCount={totalCount}
        toolbar={
          <DataTableToolbar
            table={table}
            searchColumns={["name", "email", "phone", "id"]}
            showColumnVisibility
            filters={filters}
            onRefresh={() => {
              void refetch();
            }}
            refreshing={queryLoading}
            onExport={onExport}
            exporting={exporting}
          />
        }
      />

      <GuestFormDialog open={addOpen} onOpenChange={setAddOpen} mode="add" onSubmit={handleAdd} />

      <BulkImportDialog
        open={bulkImport.dialogProps.open}
        onOpenChange={bulkImport.dialogProps.onOpenChange}
        onDownloadTemplate={bulkImport.dialogProps.onDownloadTemplate}
        downloading={bulkImport.dialogProps.downloading}
        file={bulkImport.dialogProps.file}
        onFileChange={bulkImport.dialogProps.onFileChange}
        {...(bulkImport.dialogProps.uploadedFileMeta
          ? { uploadedFileMeta: bulkImport.dialogProps.uploadedFileMeta }
          : {})}
        {...(bulkImport.dialogProps.progress != null
          ? { progress: bulkImport.dialogProps.progress }
          : {})}
        onUpload={bulkImport.dialogProps.onUpload}
        uploading={bulkImport.dialogProps.uploading}
        templateFileName={bulkImport.dialogProps.templateFileName}
        templateFileMeta={bulkImport.dialogProps.templateFileMeta}
        title={t("bulkImportTitle")}
        downloadStepTitle={t("bulkImportDownloadTitle")}
        downloadStepDescription={t("bulkImportDownloadDescription")}
        templateColumnsHint={t("bulkImportColumnsHint")}
        downloadLabel={t("bulkImportDownload")}
        uploadStepTitle={t("bulkImportUploadTitle")}
        uploadStepDescription={t("bulkImportUploadDescription")}
        accept=".csv,.xlsx"
        uploadHint={t("bulkImportUploadHint")}
        cancelLabel={t("cancel")}
        uploadLabel={t("bulkImportUpload")}
      />
    </section>
  );
}
