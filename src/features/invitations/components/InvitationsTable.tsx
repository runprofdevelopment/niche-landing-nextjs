"use client";
"use no memo";

import { useMemo } from "react";

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
} from "@/shared/components/table";
import { useTableExport } from "@/shared/hooks";

import { useInvitationTemplateListQuery } from "../graphql";

import { InvitationsTableRowActions } from "./InvitationsTableRowActions";

import type { InvitationTemplate } from "../types";
import type { ColumnDef } from "@tanstack/react-table";

export function InvitationsTable() {
  const t = useTranslations("invitations");
  const controlledState = useDataTableState();

  const paginationInput = useMemo(
    () => ({
      limit: controlledState.state.pagination.pageSize,
      page: controlledState.state.pagination.pageIndex + 1,
    }),
    [controlledState.state.pagination.pageIndex, controlledState.state.pagination.pageSize],
  );

  const sortInput = useMemo(() => {
    const sorting = controlledState.state.sorting;
    if (!sorting.length) return null;
    return sorting.map((entry) => ({
      field: entry.id,
      order: entry.desc ? ("desc" as const) : ("asc" as const),
    }));
  }, [controlledState.state.sorting]);

  const filtersInput = useMemo(() => {
    const global = controlledState.state.globalFilter?.trim();
    if (!global) return null;
    return { name: global };
  }, [controlledState.state.globalFilter]);

  const { rows, totalCount, pageCount, loading, refetch } = useInvitationTemplateListQuery({
    pagination: paginationInput,
    ...(sortInput ? { sort: sortInput } : {}),
    filters: filtersInput,
  });

  const columns = useMemo<ColumnDef<InvitationTemplate, unknown>[]>(
    () => [
      createSelectColumn<InvitationTemplate>(),
      createAccessorColumn<InvitationTemplate, string>("language", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnLanguage")} />
        ),
        meta: { label: t("columnLanguage"), align: "start" },
      }),
      createAccessorColumn<InvitationTemplate, string>("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnInvitationName")} />
        ),
        meta: { label: t("columnInvitationName"), align: "start" },
      }),
      createAccessorColumn<InvitationTemplate, string>("layout", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnTemplate")} />
        ),
        cell: ({ row }) => (
          <span>{row.original.layout === "modern" ? t("layoutModern") : t("layoutClassic")}</span>
        ),
        meta: { label: t("columnTemplate"), align: "start" },
      }),
      createAccessorColumn<InvitationTemplate, string>("accent", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnAccentColor")} />
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2">
            <span
              className="size-3 rounded-full border border-border"
              style={{ backgroundColor: row.original.accent }}
            />
            <span className="font-mono text-xs uppercase">{row.original.accent}</span>
          </span>
        ),
        meta: { label: t("columnAccentColor"), align: "start" },
      }),
      createAccessorColumn<InvitationTemplate, string>("headingFont", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnFontNames")} />
        ),
        meta: { label: t("columnFontNames"), align: "start" },
      }),
      createAccessorColumn<InvitationTemplate, string>("bodyFont", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnFontBody")} />
        ),
        meta: { label: t("columnFontBody"), align: "start" },
      }),
      createDisplayColumn<InvitationTemplate>("actions", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columnActions")} />
        ),
        cell: ({ row }) => <InvitationsTableRowActions template={row.original} />,
        meta: { label: t("columnActions"), align: "end" },
      }),
    ],
    [t],
  );

  const table = useDataTable<InvitationTemplate, unknown>({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    controlledState,
    pageCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const { exporting, onExport } = useTableExport(table, {
    collectionName: "invitations",
    fieldMap: {
      language: "language",
      name: "name",
      layout: "layout",
      accent: "accent",
      headingFont: "heading_font",
      bodyFont: "body_font",
    },
  });

  return (
    <DataTableView
      table={table}
      caption={t("allInvitations")}
      emptyMessage={t("noTemplates")}
      searchColumns={["name", "language", "layout", "headingFont", "bodyFont"]}
      loading={loading}
      totalCount={totalCount}
      toolbar={
        <DataTableToolbar
          table={table}
          searchColumns={["name", "language", "layout"]}
          showColumnVisibility
          filters={[]}
          onRefresh={() => {
            void refetch();
          }}
          refreshing={loading}
          onExport={onExport}
          exporting={exporting}
        />
      }
    />
  );
}
