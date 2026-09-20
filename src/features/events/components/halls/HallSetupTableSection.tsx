"use client";

import { Circle, PenTool, Plus, RectangleHorizontal, Square, Trash2 } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";

import type { TableConfigRow, NamingStrategy } from "../../hooks/use-hall-setup-form";
import type { TableShape } from "../../types";

type HallSetupTableSectionProps = {
  rows: TableConfigRow[];
  lockNaming?: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<TableConfigRow>) => void;
  onRemove: (id: string) => void;
};

const TABLE_SHAPES: TableShape[] = ["round", "rectangle", "square"];

const NAMING_OPTIONS: {
  value: NamingStrategy;
  labelKey: "namingNumeric" | "namingAlphabetical";
}[] = [
  { value: "numeric", labelKey: "namingNumeric" },
  { value: "alphabetical", labelKey: "namingAlphabetical" },
];

export function HallSetupTableSection({
  rows,
  lockNaming = false,
  onAdd,
  onUpdate,
  onRemove,
}: HallSetupTableSectionProps) {
  const t = useTranslations("events");

  return (
    <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("tableConfiguration")}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="me-1 size-4" />
          {t("add")}
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="relative grid gap-3 rounded-lg border border-border/50 bg-background/60 p-4 pe-14 lg:pe-4 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
          >
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("tableCapacity")}</Label>
              <Input
                type="number"
                min={1}
                value={row.capacity}
                disabled={row.createdObjectCount > 0}
                onChange={(event) =>
                  onUpdate(row.id, { capacity: Math.max(1, Number(event.target.value) || 1) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("numberOfTables")}</Label>
              <Input
                type="number"
                min={row.createdObjectCount}
                value={row.quantity}
                onChange={(event) =>
                  onUpdate(row.id, {
                    quantity: Math.max(row.createdObjectCount, Number(event.target.value) || 0),
                  })
                }
              />
              {row.createdObjectCount > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t("placedTablesLocked", { count: row.createdObjectCount })}
                  {" · "}
                  {t("remainingTemplateTables", {
                    count: Math.max(0, row.quantity - row.createdObjectCount),
                  })}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("tableShapeLabel")}</Label>
              <Select
                searchable={false}
                value={row.shape}
                disabled={row.createdObjectCount > 0}
                onValueChange={(value) => {
                  if (value) onUpdate(row.id, { shape: value as TableShape });
                }}
                items={TABLE_SHAPES.map((shape) => ({
                  value: shape,
                  label:
                    shape === "round"
                      ? t("tableShapeCircle")
                      : shape === "rectangle"
                        ? t("shapeRectangle")
                        : t("shapeSquare"),
                }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("tableNameOptional")}</Label>
              <Select
                searchable={false}
                value={row.tableNaming}
                disabled={lockNaming}
                onValueChange={(value) => {
                  if (value) onUpdate(row.id, { tableNaming: value as NamingStrategy });
                }}
                items={NAMING_OPTIONS.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("seatsNamingOptional")}</Label>
              <Select
                searchable={false}
                value={row.seatNaming}
                disabled={lockNaming}
                onValueChange={(value) => {
                  if (value) onUpdate(row.id, { seatNaming: value as NamingStrategy });
                }}
                items={NAMING_OPTIONS.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
              />
            </div>
            <div className="absolute end-3 top-3 lg:static lg:flex lg:items-end lg:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(row.id)}
                disabled={rows.length <= 1 || row.createdObjectCount > 0}
                title={
                  row.createdObjectCount > 0
                    ? t("cannotDeleteTemplate", { count: row.createdObjectCount })
                    : undefined
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            {row.createdObjectCount > 0 ? (
              <p className="text-xs text-muted-foreground lg:col-span-6">
                {t("cannotDeleteTemplate", { count: row.createdObjectCount })}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{t("tableNamingHint")}</p>
    </section>
  );
}

export const SHAPE_OPTIONS = [
  { value: "square" as const, labelKey: "shapeSquare" as const, Icon: Square },
  { value: "rectangle" as const, labelKey: "shapeRectangle" as const, Icon: RectangleHorizontal },
  { value: "circle" as const, labelKey: "shapeCircle" as const, Icon: Circle },
  { value: "polygon" as const, labelKey: "shapeCustom" as const, Icon: PenTool },
];
