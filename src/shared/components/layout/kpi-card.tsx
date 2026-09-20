import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type KpiCardTone = "default" | "success" | "warning" | "destructive";
type KpiCardLayout = "stacked" | "split";

type KpiCardProps = {
  value: ReactNode;
  label: ReactNode;
  icon?: LucideIcon;
  tone?: KpiCardTone;
  layout?: KpiCardLayout;
  className?: string;
};

const toneClass: Record<KpiCardTone, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-active/30 text-active-foreground",
  warning: "bg-pending/30 text-pending-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

export function KpiCard({
  value,
  label,
  icon: Icon,
  tone = "default",
  layout = "stacked",
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full",
            toneClass[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
      ) : null}
      <div className={cn("flex min-w-0 flex-col", layout === "split" ? "gap-0.5" : "gap-1")}>
        <span className="truncate text-2xl font-semibold text-foreground">{value}</span>
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
