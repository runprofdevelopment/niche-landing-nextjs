"use client";
"use no memo";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

import type { Column } from "@tanstack/react-table";
import type { HTMLAttributes } from "react";

type DataTableColumnHeaderProps<TData, TValue> = HTMLAttributes<HTMLDivElement> & {
  column: Column<TData, TValue>;
  title: string;
};

const justifyClassName: Record<"start" | "center" | "end", string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const alignClassName: Record<"start" | "center" | "end", string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/**
 * Accessible sortable column header. Renders a plain title when sorting is
 * disabled. Aligns itself per the column's `meta.align` (default `center`)
 * so it always lines up with `DataTable`'s cell alignment below it.
 */
function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  const t = useTranslations("dataTable");
  const align = column.columnDef.meta?.align ?? "center";

  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          "min-w-0 truncate text-xs font-medium capitalize tracking-wide",
          alignClassName[align],
          className,
        )}
        {...props}
      >
        {title}
      </div>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <div className={cn("flex min-w-0 items-center", justifyClassName[align], className)} {...props}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 min-w-0 max-w-full gap-2 data-[state=open]:bg-muted",
          align === "start" && "-ms-2",
        )}
        onClick={() => column.toggleSorting(sorted === "asc")}
        aria-label={t("sortByLabel", { column: title })}
      >
        <span className="min-w-0 truncate text-xs font-medium capitalize tracking-wide">
          {title}
        </span>
        {sorted === "desc" ? (
          <ArrowDown className="size-3.5 shrink-0" aria-hidden />
        ) : sorted === "asc" ? (
          <ArrowUp className="size-3.5 shrink-0" aria-hidden />
        ) : (
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </Button>
    </div>
  );
}

export { DataTableColumnHeader };
