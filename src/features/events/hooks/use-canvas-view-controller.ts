import { useCallback, useEffect, useRef } from "react";

import { zoomToward, type CanvasView } from "../domain/canvas-view";

import type { Point } from "../types";
import type Konva from "konva";

const VIEW_SYNC_MS = 120;

type UseCanvasViewControllerOptions = {
  zoom: number;
  pan: Point;
  onViewChange?: ((view: CanvasView) => void) | undefined;
  stageRef: React.RefObject<Konva.Stage | null>;
  /** When true, stage drag updates view only on drag end (already Stage-native). */
  enabled?: boolean;
};

/**
 * Keeps live pan/zoom on the Konva Stage during wheel/pinch, and only syncs
 * React after a short debounce (or immediately via `commitView`).
 */
export function useCanvasViewController({
  zoom,
  pan,
  onViewChange,
  stageRef,
  enabled = true,
}: UseCanvasViewControllerOptions) {
  const liveRef = useRef<CanvasView>({ zoom, pan });
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onViewChangeRef = useRef(onViewChange);

  useEffect(() => {
    onViewChangeRef.current = onViewChange;
  }, [onViewChange]);

  const applyToStage = useCallback(
    (view: CanvasView) => {
      const stage = stageRef.current;
      if (!stage) return;
      stage.scale({ x: view.zoom, y: view.zoom });
      stage.position(view.pan);
      stage.batchDraw();
    },
    [stageRef],
  );

  const scheduleSync = useCallback(() => {
    if (!onViewChangeRef.current) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      onViewChangeRef.current?.(liveRef.current);
    }, VIEW_SYNC_MS);
  }, []);

  const commitView = useCallback(
    (view: CanvasView) => {
      liveRef.current = view;
      applyToStage(view);
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      onViewChangeRef.current?.(view);
    },
    [applyToStage],
  );

  const setLiveView = useCallback(
    (view: CanvasView, sync: "debounce" | "commit" | "silent" = "debounce") => {
      liveRef.current = view;
      // During Stage drag, Konva already moved the stage — only refresh the ref.
      if (sync !== "silent") applyToStage(view);
      if (sync === "commit") {
        if (syncTimerRef.current) {
          clearTimeout(syncTimerRef.current);
          syncTimerRef.current = null;
        }
        onViewChangeRef.current?.(view);
      } else if (sync === "debounce") {
        scheduleSync();
      }
    },
    [applyToStage, scheduleSync],
  );

  // External prop changes (toolbar zoom / fit) — apply immediately to Stage.
  useEffect(() => {
    const live = liveRef.current;
    if (live.zoom === zoom && live.pan.x === pan.x && live.pan.y === pan.y) return;
    liveRef.current = { zoom, pan };
    applyToStage({ zoom, pan });
  }, [zoom, pan, applyToStage]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  const zoomAt = useCallback(
    (nextZoom: number, point: Point, sync: "debounce" | "commit" = "debounce") => {
      if (!enabled) return;
      const next = zoomToward(liveRef.current, nextZoom, point);
      setLiveView(next, sync);
    },
    [enabled, setLiveView],
  );

  const getLiveView = useCallback(() => liveRef.current, []);

  return {
    liveRef,
    getLiveView,
    setLiveView,
    commitView,
    zoomAt,
    applyToStage,
  };
}
