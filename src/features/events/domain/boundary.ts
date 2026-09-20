import { COORDINATE_SYSTEM } from "./coordinate-system";

import type { BoundaryShape, HallBoundary, Point } from "../types";

export const DRAW_SCALE = 0.5;

export const BOUNDARY_SHAPE_VALUES: BoundaryShape[] = ["rectangle", "square", "circle", "polygon"];

export function defaultBoundary(
  shape: BoundaryShape,
  points: Point[],
  dims: { width: number; height: number; radius: number },
): HallBoundary {
  const { width, height } = COORDINATE_SYSTEM;

  if (shape === "square") {
    const size = dims.width;
    return {
      shape,
      x: (width - size) / 2,
      y: (height - size) / 2,
      width: size,
      height: size,
    };
  }

  if (shape === "circle") {
    const size = dims.radius * 2;
    return {
      shape,
      x: (width - size) / 2,
      y: (height - size) / 2,
      width: size,
      height: size,
    };
  }

  if (shape === "polygon" && points.length > 2) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    return {
      shape,
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      points,
    };
  }

  return {
    shape: "rectangle",
    x: (width - dims.width) / 2,
    y: (height - dims.height) / 2,
    width: dims.width,
    height: dims.height,
  };
}
