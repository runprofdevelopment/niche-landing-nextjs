import { cn } from "@/lib/utils";

import { TABLE_PRESETS } from "../../domain/catalog";
import { SEAT_RADIUS, seatOffsets } from "../../domain/geometry";

import type { TableShape } from "../../types";

/** Matches TablePreviewCard: burgundy fill, primary stroke and seats. */
export const TABLE_GRAPHIC_COLORS = {
  fill: "rgba(96,34,52,0.12)",
  stroke: "currentColor",
  seat: "currentColor",
} as const;

const VIEW_PADDING = SEAT_RADIUS + 4;

export const PREVIEW_SEAT_LIMIT: Record<TableShape, number> = {
  square: 4,
  round: 8,
  rectangle: 6,
};

export type TableGraphicProps = {
  capacity: number;
  className?: string;
  /** CSS size of the SVG box. Default stays compact for cards. */
  size?: number;
  /**
   * `indicator` caps seats (preview cards only) and draws capacity in the table.
   * `full` draws every seat — use this in the designer.
   */
  variant?: "full" | "indicator";
};

function tableViewBox(shape: TableShape, width: number, height: number, capacity: number) {
  const seats = seatOffsets(shape, width, height, capacity);
  let minX = -width / 2;
  let maxX = width / 2;
  let minY = -height / 2;
  let maxY = height / 2;

  for (const seat of seats) {
    minX = Math.min(minX, seat.x - SEAT_RADIUS);
    maxX = Math.max(maxX, seat.x + SEAT_RADIUS);
    minY = Math.min(minY, seat.y - SEAT_RADIUS);
    maxY = Math.max(maxY, seat.y + SEAT_RADIUS);
  }

  return {
    minX: minX - VIEW_PADDING,
    minY: minY - VIEW_PADDING,
    width: maxX - minX + VIEW_PADDING * 2,
    height: maxY - minY + VIEW_PADDING * 2,
    seats,
  };
}

type TableGraphicBaseProps = TableGraphicProps & {
  shape: TableShape;
};

export function TableGraphic({
  shape,
  capacity,
  className,
  size = 88,
  variant = "full",
}: TableGraphicBaseProps) {
  const preset = TABLE_PRESETS[shape];
  const seatCount =
    variant === "indicator"
      ? Math.min(Math.max(0, capacity), PREVIEW_SEAT_LIMIT[shape])
      : Math.max(0, capacity);
  const { minX, minY, width, height, seats } = tableViewBox(
    shape,
    preset.width,
    preset.height,
    seatCount,
  );
  const labelSize = shape === "rectangle" ? 18 : 22;

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      width={size}
      height={size}
      className={cn("text-primary", className)}
      aria-hidden
    >
      {shape === "round" ? (
        <circle
          cx={0}
          cy={0}
          r={preset.width / 2}
          fill={TABLE_GRAPHIC_COLORS.fill}
          stroke={TABLE_GRAPHIC_COLORS.stroke}
          strokeWidth={2}
        />
      ) : (
        <rect
          x={-preset.width / 2}
          y={-preset.height / 2}
          width={preset.width}
          height={preset.height}
          rx={shape === "rectangle" ? 8 : 6}
          fill={TABLE_GRAPHIC_COLORS.fill}
          stroke={TABLE_GRAPHIC_COLORS.stroke}
          strokeWidth={2}
        />
      )}
      {seats.map((seat, index) => (
        <circle
          key={index}
          cx={seat.x}
          cy={seat.y}
          r={SEAT_RADIUS}
          fill={TABLE_GRAPHIC_COLORS.seat}
        />
      ))}
      {variant === "indicator" ? (
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          fontSize={labelSize}
          fontWeight={600}
        >
          {capacity}
        </text>
      ) : null}
    </svg>
  );
}

export function CircleTable(props: TableGraphicProps) {
  return <TableGraphic shape="round" {...props} />;
}

export function SquareTable(props: TableGraphicProps) {
  return <TableGraphic shape="square" {...props} />;
}

export function RectangleTable(props: TableGraphicProps) {
  return <TableGraphic shape="rectangle" {...props} />;
}
