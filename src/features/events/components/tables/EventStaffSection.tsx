"use client";

import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import {
  buildEventStaffListFilters,
  buildEventStaffListSort,
} from "@/features/events/graphql/build-event-staff-list-vars";
import {
  useEventStaffListQuery,
  useEventStaffMutations,
} from "@/features/events/graphql/hooks/use-event-staff";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
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
  type DataTableFilterDef,
} from "@/shared/components/table";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useTableExport } from "@/shared/hooks";

import { AddEventStaffDialog, type AddEventStaffSubmit } from "../dialogs";

import { EventStaffRowActions } from "./EventStaffRowActions";

import type { EventStaffRole, EventStaffRow } from "../../domain/event-staff";

type EventStaffSectionProps = {
  eventId: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function roleBadgeVariant(role: EventStaffRole): "success" | "warning" {
  return role === "staff" ? "success" : "warning";
}

export function EventStaffSection({ eventId }: EventStaffSectionProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const canCreate = can(EVENT_PERMISSIONS.staffCreate);
  const canDelete = can(EVENT_PERMISSIONS.staffDelete);
  const [addOpen, setAddOpen] = useState(false);

  const controlledState = useDataTableState({
    columnVisibility: { id: false, createdAt: false },
  });

  const sortInput = useMemo(
    () => buildEventStaffListSort(controlledState.state.sorting),
    [controlledState.state.sorting],
  );
  const filtersInput = useMemo(
    () => buildEventStaffListFilters(controlledState.state.columnFilters),
    [controlledState.state.columnFilters],
  );
  const paginationInput = useMemo(
    () => ({
      limit: controlledState.state.pagination.pageSize,
      page: controlledState.state.pagination.pageIndex + 1,
    }),
    [controlledState.state.pagination.pageIndex, controlledState.state.pagination.pageSize],
  );

  const { rows, totalCount, pageCount, loading, refetch } = useEventStaffListQuery(eventId, {
    ...(sortInput ? { sort: sortInput } : {}),
    pagination: paginationInput,
    filters: filtersInput,
  });
  const { createEventStaff, destroyEventStaff, creating } = useEventStaffMutations(eventId);

  const handleAdd = useCallback(
    async (values: AddEventStaffSubmit) => {
      try {
        await createEventStaff({
          role: values.role,
          note: values.notes,
          userId: values.memberId,
        });
        toast.success(t("eventStaffAdded", { name: "" }));
        setAddOpen(false);
      } catch {
        toast.error(t("eventStaffAddFailed"));
      }
    },
    [createEventStaff, t],
  );

  const handleRemove = useCallback(
    async (assignmentId: string) => {
      const removed = rows.find((row) => row.id === assignmentId);
      try {
        await destroyEventStaff(assignmentId);
        toast.success(t("eventStaffRemoved", { name: removed?.name ?? "" }));
      } catch {
        toast.error(t("eventStaffRemoveFailed"));
      }
    },
    [destroyEventStaff, rows, t],
  );

  const filters = useMemo<DataTableFilterDef[]>(
    () => [
      {
        id: "role",
        label: t("columnRole"),
        type: "select",
        options: [
          { value: "staff", label: t("roleStaff") },
          { value: "frontdesk", label: t("roleFrontDesk") },
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
      createSelectColumn<EventStaffRow>(),
      createAccessorColumn<EventStaffRow, string>("id", {
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => row.original.id,
        meta: { label: "ID" },
      }),
      createAccessorColumn<EventStaffRow, string>("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnStaffName")} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{row.original.name || t("emptyValue")}</span>
          </div>
        ),
        meta: { label: t("columnStaffName") },
      }),
      createAccessorColumn<EventStaffRow, string>("email", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnEmail")} />,
        cell: ({ row }) => row.original.email || t("emptyValue"),
        meta: { label: t("columnEmail") },
      }),
      createAccessorColumn<EventStaffRow, string>("phone", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnPhone")} />,
        cell: ({ row }) => row.original.phone || t("emptyValue"),
        meta: { label: t("columnPhone") },
      }),
      createAccessorColumn<EventStaffRow, EventStaffRole>("role", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columnRole")} />,
        cell: ({ row }) => (
          <Badge variant={roleBadgeVariant(row.original.role)} dot>
            {row.original.role === "frontdesk" ? t("roleFrontDesk") : t("roleStaff")}
          </Badge>
        ),
        meta: { label: t("columnRole") },
      }),
      createAccessorColumn<EventStaffRow, string>("notes", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("notes")} />,
        cell: ({ row }) =>
          row.original.notes ? (
            <span className="line-clamp-2">{row.original.notes}</span>
          ) : (
            <span className="text-muted-foreground">{t("emptyValue")}</span>
          ),
        enableSorting: false,
        meta: { label: t("notes") },
      }),
      createAccessorColumn<EventStaffRow, string>("createdAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("filterCreatedAt")} />
        ),
        cell: ({ row }) => row.original.createdAt || t("emptyValue"),
        meta: { label: t("filterCreatedAt") },
      }),
      createDisplayColumn<EventStaffRow>("actions", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnActions")} />
        ),
        cell: ({ row }) =>
          canDelete ? <EventStaffRowActions member={row.original} onRemove={handleRemove} /> : null,
        enableHiding: false,
        enableSorting: false,
        size: 72,
        meta: { label: t("columnActions"), align: "end" },
      }),
    ],
    [canDelete, handleRemove, t],
  );

  const table = useDataTable<EventStaffRow, unknown>({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
  });

  const { exporting, onExport } = useTableExport(table, {
    collectionName: "event-staff",
    fieldMap: {
      name: "name",
      email: "email",
      phone: "phone",
      role: "role",
      notes: "notes",
    },
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl font-semibold">{t("eventsStaff")}</h2>
          <Badge variant="secondary" className="rounded-full px-2.5 tabular-nums">
            {totalCount}
          </Badge>
        </div>
        {canCreate ? (
          <Button className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            {t("addStaff")}
          </Button>
        ) : null}
      </div>

      <DataTableView
        table={table}
        caption={t("eventsStaff")}
        emptyMessage={t("noEventStaffYet")}
        loading={loading}
        searchColumns={["name", "email", "phone"]}
        toolbar={
          <DataTableToolbar
            table={table}
            searchColumns={["name", "email", "phone"]}
            showColumnVisibility
            filters={filters}
            onRefresh={() => {
              void refetch();
            }}
            refreshing={loading}
            onExport={onExport}
            exporting={exporting}
          />
        }
      />

      {canCreate ? (
        <AddEventStaffDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onSubmit={handleAdd}
          submitting={creating}
        />
      ) : null}
    </section>
  );
}
