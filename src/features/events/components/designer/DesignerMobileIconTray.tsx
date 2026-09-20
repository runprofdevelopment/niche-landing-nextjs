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
import { useMemo } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { OBJECT_PRESETS } from "../../domain/catalog";
import { buildTableLibrarySlots } from "../../domain/table-templates";

import type { LibraryItem } from "./DesignerObjectsPanel";
import type { HallObject, TableShape, TableTemplate } from "../../types";

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

type DesignerMobileIconTrayProps = {
  templates: TableTemplate[];
  objects: HallObject[];
  armed: LibraryItem | null;
  onPointerDown: (item: LibraryItem, disabled: boolean) => (event: React.PointerEvent) => void;
  className?: string;
};

const circleBtn =
  "relative flex size-11 shrink-0 touch-none flex-col items-center justify-center rounded-full border bg-card text-primary shadow-md select-none active:scale-95";

/** Floating circular object tools — shape icon + remaining count badge. */
export function DesignerMobileIconTray({
  templates,
  objects,
  armed,
  onPointerDown,
  className,
}: DesignerMobileIconTrayProps) {
  const t = useTranslations("events");
  const available = useMemo(
    () => buildTableLibrarySlots(templates, objects).filter((slot) => !slot.placed),
    [objects, templates],
  );

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {SHAPE_GROUPS.map(({ shape, titleKey, Icon }) => {
        const next = available.find((slot) => slot.shape === shape);
        const remaining = available.filter((slot) => slot.shape === shape).length;
        if (!next || remaining === 0) return null;

        const item: LibraryItem = {
          kind: "table",
          id: next.templateId,
          label: next.label,
          slotIndex: next.slotIndex,
        };
        const selected =
          armed?.kind === "table" &&
          armed.id === next.templateId &&
          armed.slotIndex === next.slotIndex;

        return (
          <button
            key={shape}
            type="button"
            title={`${t(titleKey)} · ${next.label}`}
            aria-label={`${t(titleKey)}, ${next.label}`}
            onPointerDown={onPointerDown(item, false)}
            className={cn(
              circleBtn,
              selected && "border-primary bg-selected ring-2 ring-primary/35",
            )}
          >
            <Icon className="size-5" strokeWidth={2.25} />
            <span className="absolute -end-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {remaining}
            </span>
          </button>
        );
      })}

      <div className="h-px w-6 bg-border" aria-hidden />

      {OBJECT_PRESETS.map((preset) => {
        const Icon = OBJECT_ICONS[preset.type as keyof typeof OBJECT_ICONS] ?? Sparkles;
        const labelKey = OBJECT_LABEL_KEYS[preset.type as keyof typeof OBJECT_LABEL_KEYS];
        const label = labelKey ? t(labelKey) : preset.type;
        const item: LibraryItem = { kind: "object", id: preset.type, label: preset.type };
        const selected = armed?.kind === "object" && armed.id === preset.type;
        return (
          <button
            key={preset.type}
            type="button"
            title={label}
            aria-label={label}
            onPointerDown={onPointerDown(item, false)}
            className={cn(
              circleBtn,
              selected && "border-primary bg-selected ring-2 ring-primary/35",
            )}
          >
            <Icon className="size-5" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
