"use client";

import { Star } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

type HallSetupStatsBarProps = {
  hallCapacity: number;
  expectedGuests: number;
  tableCount: number;
  remainingCapacity: number;
};

export function HallSetupStatsBar({
  hallCapacity,
  expectedGuests,
  tableCount,
  remainingCapacity,
}: HallSetupStatsBarProps) {
  const t = useTranslations("events");

  const stats = [
    {
      label: t("hallCapacity"),
      value: hallCapacity.toLocaleString(),
    },
    {
      label: t("expectedGuests"),
      value: expectedGuests.toLocaleString(),
    },
    {
      label: t("tableCount"),
      value: tableCount.toLocaleString(),
    },
    {
      label: t("remainingCapacity"),
      value: remainingCapacity.toLocaleString(),
    },
  ];

  return (
    <div className="grid gap-4 rounded-xl bg-secondary px-4 py-5 text-primary-foreground sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {stats.map(({ label, value }, index) => (
        <div
          key={label}
          className={cn("flex items-center gap-2", index > 0 && "lg:border-s lg:ps-4")}
        >
          {index === 0 ? <Star className="size-6 shrink-0" /> : null}
          <div className="space-y-1">
            <p className="text-xs font-medium opacity-90">{label}</p>
            <p className="text-lg font-semibold tabular-nums sm:text-xl">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
