"use client";
"use no memo";

import { useTranslations } from "@/hooks/useTranslations";

import { Checkbox } from "../../ui/checkbox";

import type { ColumnDef, Row, Table } from "@tanstack/react-table";

const SELECT_COLUMN_ID = "select";

type SelectColumnOptions = {
  id?: string;
};

function SelectAllHeader<TData>({ table }: { table: Table<TData> }) {
  const t = useTranslations("dataTable");
  const allSelected = table.getIsAllPageRowsSelected();
  const someSelected = table.getIsSomePageRowsSelected() && !allSelected;

  return (
    <Checkbox
      aria-label={t("selectAllRowsLabel")}
      checked={allSelected}
      indeterminate={someSelected}
      onCheckedChange={(checked) => {
        table.toggleAllPageRowsSelected(checked === true);
      }}
    />
  );
}

function SelectRowCell<TData>({ row }: { row: Row<TData> }) {
  const t = useTranslations("dataTable");
  const selected = row.getIsSelected();

  return (
    <Checkbox
      aria-label={t("selectRowLabel", { id: row.id })}
      checked={selected}
      disabled={!row.getCanSelect()}
      onCheckedChange={(checked) => {
        row.toggleSelected(checked === true);
      }}
    />
  );
}

/**
 * Optional row-selection column using the shared `Checkbox`.
 *
 * Pair with `enableRowSelection: true` on `useDataTable`.
 */
export function createSelectColumn<TData>(options: SelectColumnOptions = {}): ColumnDef<TData> {
  const columnId = options.id ?? SELECT_COLUMN_ID;

  return {
    id: columnId,
    header: ({ table }) => <SelectAllHeader table={table} />,
    cell: ({ row }) => <SelectRowCell row={row} />,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 44,
    minSize: 44,
    maxSize: 44,
    meta: { truncate: false },
  };
}

export { SELECT_COLUMN_ID };
