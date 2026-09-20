"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { DRAW_SCALE } from "../../domain/boundary";
import { COORDINATE_SYSTEM } from "../../domain/coordinate-system";

import { SHAPE_OPTIONS } from "./HallSetupTableSection";

import type { BoundaryShape, Point } from "../../types";

type HallSetupLayoutSectionProps = {
  shape: BoundaryShape;
  onShapeChange: (shape: BoundaryShape) => void;
  widthMeters: number;
  heightMeters: number;
  radiusMeters: number;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  polygonPoints: Point[];
  polygonClosed: boolean;
  onAddPoint: (point: Point) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onConfirmShape: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function HallSetupLayoutSection({
  shape,
  onShapeChange,
  widthMeters,
  heightMeters,
  radiusMeters,
  onWidthChange,
  onHeightChange,
  onRadiusChange,
  polygonPoints,
  polygonClosed,
  onAddPoint,
  onUndo,
  onRedo,
  onClear,
  onConfirmShape,
  canUndo,
  canRedo,
}: HallSetupLayoutSectionProps) {
  const t = useTranslations("events");

  return (
    <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">{t("layoutConfiguration")}</h2>

      <div className="mt-4">
        <Label className="text-sm text-muted-foreground">{t("hallShape")}</Label>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHAPE_OPTIONS.map(({ value, labelKey, Icon }) => {
            const selected = shape === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onShapeChange(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border bg-background/60 px-4 py-5 transition-colors hover:bg-secondary/20",
                  selected ? "border-primary ring-2 ring-primary/20" : "border-border/60",
                )}
              >
                <Icon className="size-8 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-medium">{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {shape === "polygon" ? (
        <div className="mt-6 space-y-3">
          <div>
            <h3 className="font-medium">{t("drawHallShape")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("drawHallShapeHint")}</p>
          </div>
          <svg
            role="presentation"
            className="w-full touch-none cursor-crosshair rounded-xl border border-border/60 bg-muted/30"
            viewBox={`0 0 ${COORDINATE_SYSTEM.width * DRAW_SCALE} ${COORDINATE_SYSTEM.height * DRAW_SCALE}`}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const scaleX = (COORDINATE_SYSTEM.width * DRAW_SCALE) / rect.width;
              const x = Math.round(((event.clientX - rect.left) * scaleX) / DRAW_SCALE);
              const y = Math.round(((event.clientY - rect.top) * scaleX) / DRAW_SCALE);
              onAddPoint({ x, y });
            }}
          >
            <defs>
              <pattern
                id="hall-grid"
                width={20 * DRAW_SCALE}
                height={20 * DRAW_SCALE}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${20 * DRAW_SCALE} 0 L 0 0 0 ${20 * DRAW_SCALE}`}
                  fill="none"
                  stroke="color-mix(in oklab, var(--primary) 8%, transparent)"
                  strokeWidth={1}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hall-grid)" />
            {polygonPoints.length > 1 && (
              <polygon
                points={polygonPoints
                  .map((point) => `${point.x * DRAW_SCALE},${point.y * DRAW_SCALE}`)
                  .join(" ")}
                fill="color-mix(in oklab, var(--primary) 12%, transparent)"
                stroke="var(--outline)"
                strokeWidth={2}
              />
            )}
            {polygonPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x * DRAW_SCALE}
                cy={point.y * DRAW_SCALE}
                r={5}
                fill="var(--primary)"
              />
            ))}
          </svg>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
              >
                {t("undo")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
              >
                {t("redo")}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onClear}>
                {t("clear")}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {t("verticesStatus", {
                  count: polygonPoints.length,
                  closed: polygonClosed ? t("shapeClosed") : t("shapeOpen"),
                })}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={onConfirmShape}
                disabled={polygonPoints.length < 3}
              >
                {t("confirmShape")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {shape === "circle" ? (
            <div className="space-y-1.5">
              <Label>{t("diameterMeters")}</Label>
              <Input
                type="number"
                min={5}
                step={0.5}
                value={radiusMeters * 2}
                onChange={(event) =>
                  onRadiusChange(Math.max(2.5, Number(event.target.value) / 2 || 15))
                }
              />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>{shape === "square" ? t("sizeMeters") : t("widthMeters")}</Label>
                <Input
                  type="number"
                  min={5}
                  step={0.5}
                  value={widthMeters}
                  onChange={(event) => onWidthChange(Math.max(5, Number(event.target.value) || 30))}
                />
              </div>
              {shape === "rectangle" && (
                <div className="space-y-1.5">
                  <Label>{t("heightMeters")}</Label>
                  <Input
                    type="number"
                    min={5}
                    step={0.5}
                    value={heightMeters}
                    onChange={(event) =>
                      onHeightChange(Math.max(5, Number(event.target.value) || 30))
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
