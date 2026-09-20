export const MIN_ZOOM = 0.08;
export const MAX_ZOOM = 5;

export type CanvasView = {
  zoom: number;
  pan: { x: number; y: number };
};

export function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function zoomToward(
  view: CanvasView,
  nextZoom: number,
  point: { x: number; y: number },
): CanvasView {
  const zoom = clampZoom(nextZoom);
  const k = zoom / view.zoom;
  return {
    zoom,
    pan: {
      x: point.x - (point.x - view.pan.x) * k,
      y: point.y - (point.y - view.pan.y) * k,
    },
  };
}
