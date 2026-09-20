import type { EventTableGuest, EventTableSummary } from "../../domain/event-tables";
import type { EventTablesListRowNode } from "../queries/event-tables-list";

function tableCode(
  label: string,
  tableNumber: number | null | undefined,
  fallback: number,
): string {
  const parsed = tableNumber ?? Number(label.match(/(\d+)/)?.[1]);
  return `T${Number.isFinite(parsed) ? parsed : fallback}`;
}

export function mapEventTablesListRow(row: EventTablesListRowNode, index = 0): EventTableSummary {
  const label = row.label?.trim() || row.name?.trim() || "";
  const name = row.name?.trim() || label || `Table ${row.tableNumber ?? index + 1}`;
  const guests: EventTableGuest[] = (row.assignedGuests ?? [])
    .filter((guest): guest is NonNullable<typeof guest> & { id: string } => Boolean(guest?.id))
    .map((guest) => ({
      id: guest.id,
      name: guest.name?.trim() || "",
      email: guest.email?.trim() || "",
    }));

  return {
    id: row.id,
    name,
    label,
    tableNumber: row.tableNumber ?? null,
    code: tableCode(label || name, row.tableNumber, index + 1),
    capacity: row.capacity ?? 0,
    guests,
  };
}
