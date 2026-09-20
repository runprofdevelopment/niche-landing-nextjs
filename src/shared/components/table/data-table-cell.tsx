"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import type { ReactNode } from "react";

const DataTableCellContext = createContext(false);

type DataTableCellProps = {
  children: ReactNode;
  className?: string;
  /**
   * Tailwind max-width class for the truncated span.
   * Defaults to `max-w-full` so text follows the resizable column width.
   */
  maxWidthClassName?: string;
  /**
   * Pixel cap for the truncated text. `DataTable` passes this for columns that
   * are still sized by their content, so one long value can't stretch a column
   * across the whole table.
   */
  maxWidth?: number;
};

function readCellLabel(node: HTMLElement | null): string {
  return node?.innerText.replace(/\s+/g, " ").trim() ?? "";
}

/**
 * Table cell text that truncates with an ellipsis and shows the full value
 * in a tooltip on hover.
 */
function DataTableCell({
  children,
  className,
  maxWidthClassName = "max-w-full",
  maxWidth,
}: DataTableCellProps) {
  const nested = useContext(DataTableCellContext);
  const textRef = useRef<HTMLSpanElement>(null);
  const literalText =
    typeof children === "string" || typeof children === "number" ? String(children) : null;
  const [label, setLabel] = useState(literalText ?? "");

  useLayoutEffect(() => {
    if (nested) return;
    setLabel(literalText ?? readCellLabel(textRef.current));
  }, [children, literalText, nested]);

  if (children == null || children === "") {
    return null;
  }

  if (nested) {
    return <span className={className}>{children}</span>;
  }

  const truncated = (
    <span
      ref={textRef}
      className={cn("block min-w-0 w-full truncate", maxWidthClassName, className)}
      style={maxWidth == null ? undefined : { maxWidth }}
    >
      {children}
    </span>
  );

  return (
    <DataTableCellContext.Provider value={true}>
      {label ? (
        <Tooltip>
          <TooltipTrigger
            closeDelay={300}
            render={<span className="block min-w-0 w-full" tabIndex={0} />}
          >
            {truncated}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs cursor-text select-text">
            <div className="max-h-64 overflow-y-auto wrap-break-word select-text">{label}</div>
          </TooltipContent>
        </Tooltip>
      ) : (
        truncated
      )}
    </DataTableCellContext.Provider>
  );
}

export { DataTableCell, type DataTableCellProps };
