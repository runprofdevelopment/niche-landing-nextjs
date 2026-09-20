"use client";

import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

import { DropdownMenuTrigger } from "../navigation";
import { Button } from "../ui";

type TableRowActionsTriggerProps = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

function TableRowActionsTrigger({
  label,
  loading = false,
  disabled = false,
  className,
}: TableRowActionsTriggerProps) {
  return (
    <DropdownMenuTrigger
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className={cn("text-muted-foreground hover:text-foreground", className)}
          disabled={disabled}
          loading={loading}
        />
      }
    >
      <MoreHorizontal className="size-4" />
    </DropdownMenuTrigger>
  );
}

export { TableRowActionsTrigger };
export type { TableRowActionsTriggerProps };
