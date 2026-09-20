import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type DetailRowProps = {
  label: string;
  value: ReactNode;
  /** Renders a bottom border under the row (e.g. stacked detail cards). */
  border?: boolean;
  className?: string;
};

/** Label / value row used on detail info cards. */
function DetailRow({ label, value, border = false, className }: DetailRowProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 items-center gap-0.5 sm:grid-cols-2 sm:gap-4",
        border && "border-b border-border pb-3",
        className,
      )}
    >
      <span className="text-sm font-semibold text-foreground">{label} :</span>
      <span className="min-w-0 text-sm break-all text-muted-foreground">{value}</span>
    </div>
  );
}

export { DetailRow, type DetailRowProps };
