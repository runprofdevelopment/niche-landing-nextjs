"use client";

import { useTranslations } from "@/hooks/useTranslations";

import { TableGraphic } from "../tables";

import type { TableShape } from "../../types";

type TablePreviewCardProps = {
  shape: TableShape;
  capacity: number;
  quantity: number;
};

export function TablePreviewCard({ shape, capacity, quantity }: TablePreviewCardProps) {
  const t = useTranslations("events");
  const totalSeats = capacity * quantity;

  const shapeLabel =
    shape === "round"
      ? t("tableShapeRound")
      : shape === "rectangle"
        ? t("tableShapeRectangle")
        : t("tableShapeSquare");

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mx-auto flex h-24 items-center justify-center">
        <TableGraphic shape={shape} capacity={capacity} size={88} variant="indicator" />
      </div>

      <div className="mt-3 text-center">
        <span className="inline-block rounded-md bg-secondary/30 px-3 py-1 text-sm font-medium text-foreground">
          {totalSeats}/{totalSeats} {shapeLabel}
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("previewShape")}</dt>
          <dd className="font-medium capitalize">
            {shape === "round"
              ? t("shapeCircle")
              : shape === "rectangle"
                ? t("shapeRectangle")
                : t("shapeSquare")}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("previewSeatsPerTable")}</dt>
          <dd className="font-medium tabular-nums">{capacity}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("previewNumberOfTables")}</dt>
          <dd className="font-medium tabular-nums">{quantity}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("previewTotalSeats")}</dt>
          <dd className="font-medium tabular-nums">{totalSeats}</dd>
        </div>
      </dl>
    </div>
  );
}
