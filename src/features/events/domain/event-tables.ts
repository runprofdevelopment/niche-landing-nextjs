export type EventTableGuest = {
  id: string;
  name: string;
  email?: string;
};

/**
 * Flat view of a table for list/guest screens (from `eventTablesList`).
 */
export type EventTableSummary = {
  id: string;
  name: string;
  label: string;
  tableNumber: number | null;
  /** Short badge label, e.g. "T3". */
  code: string;
  capacity: number;
  guests: EventTableGuest[];
};
