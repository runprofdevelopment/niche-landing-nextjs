"use client";

import {
  Circle,
  DoorOpen,
  RectangleHorizontal,
  Sparkles,
  Square,
  Star,
  Waypoints,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";

import { OBJECT_PRESETS } from "../../domain/catalog";
import { buildTableLibrarySlots } from "../../domain/table-templates";

import type { HallObject, TableShape, TableTemplate } from "../../types";

export type LibraryItem =
  | { kind: "table"; id: string; label: string; slotIndex: number }
  | { kind: "object"; id: string; label: string };

const SHAPE_GROUPS: {
  shape: TableShape;
  titleKey: "roundedTables" | "squareTables" | "rectangleTables";
  Icon: typeof Circle;
}[] = [
  { shape: "round", titleKey: "roundedTables", Icon: Circle },
  { shape: "square", titleKey: "squareTables", Icon: Square },
  { shape: "rectangle", titleKey: "rectangleTables", Icon: RectangleHorizontal },
];

const OBJECT_ICONS = {
  entrance: DoorOpen,
  stage: Sparkles,
  vip: Star,
  walkway: Waypoints,
} as const;

const OBJECT_LABEL_KEYS = {
  entrance: "entrance",
  stage: "stage",
  vip: "vipAreas",
  walkway: "walkways",
} as const;

type DesignerObjectsPanelProps = {
  templates: TableTemplate[];
  objects: HallObject[];
  armed: LibraryItem | null;
  onPointerDown: (item: LibraryItem, disabled: boolean) => (event: React.PointerEvent) => void;
  className?: string;
};

export function DesignerObjectsPanel({
  templates,
  objects,
  armed,
  onPointerDown,
  className,
}: DesignerObjectsPanelProps) {
  const t = useTranslations("events");
  const slots = useMemo(() => buildTableLibrarySlots(templates, objects), [objects, templates]);
  const availableGroups = SHAPE_GROUPS.filter(({ shape }) =>
    slots.some((slot) => slot.shape === shape),
  );
  const [openShape, setOpenShape] = useState<TableShape | null>(
    () => availableGroups[0]?.shape ?? null,
  );

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-background text-primary", className)}>
      {/* Entire panel may scroll as one column; table lists themselves never use overflow scroll */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {availableGroups.map(({ shape, titleKey, Icon }) => {
          const groupSlots = slots.filter((slot) => slot.shape === shape);
          const remaining = groupSlots.filter((slot) => !slot.placed).length;
          const open = openShape === shape;

          return (
            <Collapsible
              key={shape}
              open={open}
              onOpenChange={(next) => setOpenShape(next ? shape : null)}
            >
              <div className="rounded-2xl border border-border/80 bg-card shadow-none">
                <CollapsibleTrigger className="flex w-full items-center gap-2.5 px-3.5 py-3 text-start text-sm font-semibold text-primary hover:bg-accent/30">
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1 truncate">{t(titleKey)}</span>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary">
                    {remaining}
                  </span>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-0.5 border-t border-border/70 px-1.5 py-1.5">
                    {groupSlots.map((slot) => {
                      const item: LibraryItem = {
                        kind: "table",
                        id: slot.templateId,
                        label: slot.label,
                        slotIndex: slot.slotIndex,
                      };
                      const selected =
                        armed?.kind === "table" &&
                        armed.id === slot.templateId &&
                        armed.slotIndex === slot.slotIndex;
                      return (
                        <div
                          key={`${slot.templateId}-${slot.slotIndex}`}
                          onPointerDown={onPointerDown(item, slot.placed)}
                          className={cn(
                            "flex touch-none items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm text-primary select-none",
                            slot.placed
                              ? "cursor-not-allowed opacity-40"
                              : "cursor-grab active:cursor-grabbing hover:bg-muted/60",
                            selected && "bg-selected text-selected-foreground",
                          )}
                          title={slot.placed ? t("placedTablesLocked", { count: 1 }) : undefined}
                        >
                          <Icon className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
                          <span className="min-w-0 flex-1 truncate font-medium">{slot.label}</span>
                          <span className="shrink-0 text-xs font-normal text-muted-foreground">
                            {slot.capacity} {t("seats")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {/* Layout objects — full-width rows like the mock */}
        <div className="space-y-2.5 pt-1">
          {OBJECT_PRESETS.map((preset) => {
            const Icon = OBJECT_ICONS[preset.type as keyof typeof OBJECT_ICONS] ?? Sparkles;
            const labelKey = OBJECT_LABEL_KEYS[preset.type as keyof typeof OBJECT_LABEL_KEYS];
            const selected = armed?.kind === "object" && armed.id === preset.type;
            return (
              <button
                key={preset.type}
                type="button"
                onPointerDown={onPointerDown(
                  { kind: "object", id: preset.type, label: preset.type },
                  false,
                )}
                className={cn(
                  "flex w-full touch-none items-center gap-2.5 rounded-2xl border border-border/80 bg-card px-3.5 py-3 text-sm font-semibold text-primary transition-colors select-none hover:bg-accent/30",
                  selected && "border-primary bg-selected",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.6} />
                <span className="truncate">{labelKey ? t(labelKey) : preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
