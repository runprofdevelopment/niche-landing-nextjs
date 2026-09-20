"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type TagProps = {
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
  removeLabel?: string;
};

function Tag({ children, className, onRemove, removeLabel }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-foreground",
        className,
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

export { Tag };
