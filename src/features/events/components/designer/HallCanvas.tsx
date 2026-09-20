"use client";

import Konva from "konva";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Ellipse, Line, Group, Text, Transformer } from "react-konva";

import { clampZoom } from "../../domain/canvas-view";
import { seatOffsets, snap, validatePlacement } from "../../domain/geometry";
import { useCanvasPalette } from "../../hooks/use-canvas-palette";
import { useCanvasViewController } from "../../hooks/use-canvas-view-controller";

import type { CanvasColors, ObjectStyle } from "../../domain/catalog";
import type { HallBoundary, HallObject, Point } from "../../types";

export type SeatInfo = {
  id: string;
  number: number;
  guestName?: string;
  /** When true (or guestName is set), the seat dot renders green. */
  taken?: boolean;
};

export type HallCanvasProps = {
  boundary: HallBoundary;
  objects: HallObject[];
  coordinateSystem: { width: number; height: number };
  mode?: "edit" | "view";
  zoom: number;
  pan: Point;
  onViewChange?: (v: { zoom: number; pan: Point }) => void;
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  onLive?: (id: string, patch: Partial<HallObject>) => void;
  onCommit?: (id: string, patch: Partial<HallObject>) => void;
  drawing?: { mode: "polygon" | "path"; points: number[] } | null;
  onDrawPoint?: (x: number, y: number) => void;
  onFinishDrawing?: () => void;
  /** view mode: seat occupancy per table for the seating screen */
  seatsByTable?: Record<string, SeatInfo[]>;
  highlightTableId?: string | null;
  onTableClick?: (tableId: string) => void;
  /** wayfinding: dashed route drawn from the entrance to a seat (logical units) */
  routePath?: Point[];
  /** wayfinding: pulsing marker at the guest's seat */
  seatMarker?: Point | null;
  /** auto zoom/pan so the whole hall fits the container (responsive screens) */
  autoFit?: boolean;
  /** tap/click on empty canvas — used for tap-to-place on touch devices */
  onCanvasTap?: (p: Point) => void;
};

function boundaryPoints(b: HallBoundary): number[] {
  return (b.points ?? []).flatMap((p) => [p.x, p.y]);
}

const EMPTY_SELECTED_IDS: string[] = [];

function seatsVisualEqual(a: SeatInfo[] | undefined, b: SeatInfo[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i]!;
    const right = b[i]!;
    if (
      left.number !== right.number ||
      left.taken !== right.taken ||
      left.guestName !== right.guestName
    ) {
      return false;
    }
  }
  return true;
}

function pointsVisualEqual(a: Point[] | undefined, b: Point[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i]!.x !== b[i]!.x || a[i]!.y !== b[i]!.y) return false;
  }
  return true;
}

/** Compare only fields that affect ObjectNode paint / hit targets. */
function hallObjectVisualEqual(a: HallObject, b: HallObject): boolean {
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.label === b.label &&
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.rotation === b.rotation &&
    a.zIndex === b.zIndex &&
    a.geometry === b.geometry &&
    a.tableShape === b.tableShape &&
    a.capacity === b.capacity &&
    a.reservedSeats === b.reservedSeats &&
    a.templateId === b.templateId &&
    pointsVisualEqual(a.points, b.points)
  );
}

type ObjectNodeProps = {
  obj: HallObject;
  mode: "edit" | "view";
  gridSize: number;
  snapToGrid: boolean;
  selected: boolean;
  valid: boolean;
  seats?: SeatInfo[] | undefined;
  highlighted: boolean;
  canvas: CanvasColors;
  objectStyle: Record<string, ObjectStyle>;
  enableShadows: boolean;
  onSelectObject: (id: string, isTable: boolean) => void;
  onLive?: ((id: string, patch: Partial<HallObject>) => void) | undefined;
  onCommit?: ((id: string, patch: Partial<HallObject>) => void) | undefined;
};

function objectNodePropsEqual(prev: ObjectNodeProps, next: ObjectNodeProps): boolean {
  return (
    hallObjectVisualEqual(prev.obj, next.obj) &&
    prev.mode === next.mode &&
    prev.gridSize === next.gridSize &&
    prev.snapToGrid === next.snapToGrid &&
    prev.selected === next.selected &&
    prev.valid === next.valid &&
    prev.highlighted === next.highlighted &&
    prev.enableShadows === next.enableShadows &&
    prev.canvas === next.canvas &&
    prev.objectStyle === next.objectStyle &&
    prev.onSelectObject === next.onSelectObject &&
    prev.onLive === next.onLive &&
    prev.onCommit === next.onCommit &&
    seatsVisualEqual(prev.seats, next.seats)
  );
}

export default function HallCanvas(props: HallCanvasProps) {
  const {
    boundary,
    objects,
    coordinateSystem,
    mode = "edit",
    zoom,
    pan,
    onViewChange,
    showGrid = true,
    gridSize = 20,
    snapToGrid = true,
    selectedIds = EMPTY_SELECTED_IDS,
    onSelect,
    onLive,
    onCommit,
    drawing,
    onDrawPoint,
    onFinishDrawing,
    seatsByTable,
    highlightTableId,
    onTableClick,
    routePath,
    seatMarker,
    autoFit = false,
    onCanvasTap,
  } = props;

  void coordinateSystem;

  const { canvas: CANVAS_COLORS, objectStyle: OBJECT_STYLE } = useCanvasPalette();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const objectsLayerRef = useRef<Konva.Layer | null>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const pinchingRef = useRef(false);
  const autoFitDoneRef = useRef(false);

  // Keep parent handlers in refs so ObjectNode can receive stable callbacks.
  const modeRef = useRef(mode);
  const onSelectRef = useRef(onSelect);
  const onTableClickRef = useRef(onTableClick);
  const onLiveRef = useRef(onLive);
  const onCommitRef = useRef(onCommit);
  useEffect(() => {
    modeRef.current = mode;
    onSelectRef.current = onSelect;
    onTableClickRef.current = onTableClick;
    onLiveRef.current = onLive;
    onCommitRef.current = onCommit;
  }, [mode, onSelect, onTableClick, onLive, onCommit]);

  const onSelectObject = useCallback((id: string, isTable: boolean) => {
    if (modeRef.current === "edit") onSelectRef.current?.([id]);
    if (isTable) onTableClickRef.current?.(id);
  }, []);

  const stableOnLive = useCallback((id: string, patch: Partial<HallObject>) => {
    onLiveRef.current?.(id, patch);
  }, []);

  const stableOnCommit = useCallback((id: string, patch: Partial<HallObject>) => {
    onCommitRef.current?.(id, patch);
  }, []);

  const { getLiveView, setLiveView, commitView, zoomAt } = useCanvasViewController({
    zoom,
    pan,
    onViewChange,
    stageRef,
  });

  const fitToBoundary = useCallback(
    (w: number, h: number, sync: "commit" | "debounce" = "commit") => {
      if (!autoFit || w < 40 || h < 40) return;
      const pad = 16;
      const bw = Math.max(1, boundary.width);
      const bh = Math.max(1, boundary.height);
      const z = clampZoom(Math.min((w - pad * 2) / bw, (h - pad * 2) / bh));
      const next = {
        zoom: z,
        pan: {
          x: (w - bw * z) / 2 - boundary.x * z,
          y: (h - bh * z) / 2 - boundary.y * z,
        },
      };
      if (sync === "commit") commitView(next);
      else setLiveView(next, "debounce");
    },
    [autoFit, boundary, commitView, setLiveView],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize({ width: w, height: h });
      if (autoFit && !autoFitDoneRef.current && w >= 40 && h >= 40) {
        autoFitDoneRef.current = true;
        fitToBoundary(w, h, "commit");
      }
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    if (autoFit && el.clientWidth >= 40 && el.clientHeight >= 40) {
      autoFitDoneRef.current = true;
      fitToBoundary(el.clientWidth, el.clientHeight, "commit");
    }
    return () => ro.disconnect();
  }, [autoFit, fitToBoundary]);

  // Wheel + pinch: mutate Stage only, debounce React sync.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const intensity = e.ctrlKey || e.metaKey ? 0.012 : 0.0035;
      const cur = getLiveView();
      zoomAt(cur.zoom * Math.exp(-dy * intensity), point, "debounce");
    };

    let lastDist = 0;

    const pinchCenter = (e: TouchEvent) => {
      const rect = el.getBoundingClientRect();
      const a = e.touches[0]!;
      const b = e.touches[1]!;
      return {
        dist: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
        point: {
          x: (a.clientX + b.clientX) / 2 - rect.left,
          y: (a.clientY + b.clientY) / 2 - rect.top,
        },
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) {
        pinchingRef.current = false;
        lastDist = 0;
        return;
      }
      pinchingRef.current = true;
      lastDist = pinchCenter(e).dist;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || lastDist < 1) return;
      e.preventDefault();
      pinchingRef.current = true;
      const { dist, point } = pinchCenter(e);
      const cur = getLiveView();
      zoomAt(cur.zoom * (dist / lastDist), point, "debounce");
      lastDist = dist;
    };

    const onTouchEnd = () => {
      pinchingRef.current = false;
      lastDist = 0;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [getLiveView, zoomAt]);

  // Placement checks only matter while editing.
  const validity = useMemo(() => {
    if (mode === "view") return {} as Record<string, { valid: boolean; reason?: string }>;
    const map: Record<string, { valid: boolean; reason?: string }> = {};
    for (const o of objects) map[o.id] = validatePlacement(o, objects, boundary);
    return map;
  }, [mode, objects, boundary]);

  useEffect(() => {
    const tr = trRef.current;
    const layer = objectsLayerRef.current;
    if (!tr || !layer) return;
    if (mode !== "edit" || selectedIds.length === 0) {
      tr.nodes([]);
      return;
    }
    const nodes = selectedIds.map((id) => layer.findOne(`#${id}`)).filter(Boolean) as Konva.Node[];
    tr.nodes(nodes);
    tr.forceUpdate();
    layer.batchDraw();
  }, [selectedIds, objects, mode]);

  const toLogical = useCallback(
    (clientX: number, clientY: number): Point => {
      const el = containerRef.current;
      const view = getLiveView();
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return {
        x: (clientX - rect.left - view.pan.x) / view.zoom,
        y: (clientY - rect.top - view.pan.y) / view.zoom,
      };
    },
    [getLiveView],
  );

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const view = getLiveView();

    if (drawing) {
      const p = stage.getPointerPosition();
      if (!p) return;
      const lx = snap((p.x - view.pan.x) / view.zoom, gridSize, snapToGrid);
      const ly = snap((p.y - view.pan.y) / view.zoom, gridSize, snapToGrid);
      onDrawPoint?.(lx, ly);
      return;
    }

    if (hitsObjectOrTransformer(e.target, stage)) {
      if (hitsTransformer(e.target, stage)) stage.draggable(false);
      return;
    }
    if (!drawing) stage.draggable(true);

    onSelect?.([]);
    const p = stage.getPointerPosition();
    if (p) {
      onCanvasTap?.({
        x: (p.x - view.pan.x) / view.zoom,
        y: (p.y - view.pan.y) / view.zoom,
      });
    }
  };

  // Static grid over the hall (not rebuilt every pan frame).
  const grid = useMemo(() => {
    if (!showGrid) {
      return {
        lines: [] as number[][],
        bounds: null as null | { x: number; y: number; w: number; h: number },
      };
    }
    const pad = gridSize * 8;
    const left = Math.floor((boundary.x - pad) / gridSize) * gridSize;
    const top = Math.floor((boundary.y - pad) / gridSize) * gridSize;
    const right = Math.ceil((boundary.x + boundary.width + pad) / gridSize) * gridSize;
    const bottom = Math.ceil((boundary.y + boundary.height + pad) / gridSize) * gridSize;
    const lines: number[][] = [];
    for (let x = left; x <= right; x += gridSize) lines.push([x, top, x, bottom]);
    for (let y = top; y <= bottom; y += gridSize) lines.push([left, y, right, y]);
    return {
      lines,
      bounds: { x: left, y: top, w: right - left, h: bottom - top },
    };
  }, [showGrid, gridSize, boundary.x, boundary.y, boundary.width, boundary.height]);

  const sortedObjects = useMemo(() => {
    const orderUnchanged =
      objects.length > 1 &&
      objects.every((object, index, list) => {
        if (index === 0) return true;
        return list[index - 1]!.zIndex <= object.zIndex;
      });
    if (orderUnchanged) return objects;
    return [...objects].sort((a, b) => a.zIndex - b.zIndex);
  }, [objects]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const roundSelection =
    selectedIds.length === 1 &&
    objects.some(
      (object) =>
        object.id === selectedIds[0] && object.type === "table" && object.tableShape === "round",
    );

  const enableShadows = mode === "edit";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full min-h-0 overflow-hidden"
      style={{
        background: CANVAS_COLORS.pageBg,
        cursor: drawing ? "crosshair" : "grab",
        touchAction: "none",
      }}
      onDoubleClick={() => drawing && onFinishDrawing?.()}
      data-hall-canvas
      data-to-logical
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const raw =
          e.dataTransfer.getData("application/x-hall-item") || e.dataTransfer.getData("text/plain");
        if (!raw) return;
        const p = toLogical(e.clientX, e.clientY);
        window.dispatchEvent(
          new CustomEvent("hall-canvas-drop", { detail: { raw, x: p.x, y: p.y } }),
        );
      }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        draggable={!drawing}
        dragDistance={mode === "view" ? 8 : 3}
        dragBoundFunc={(pos) => {
          if (pinchingRef.current) {
            const view = getLiveView();
            return { x: view.pan.x, y: view.pan.y };
          }
          return pos;
        }}
        onDragMove={(e) => {
          if (e.target !== stageRef.current) return;
          // Keep live ref in sync without React setState.
          setLiveView(
            { zoom: getLiveView().zoom, pan: { x: e.target.x(), y: e.target.y() } },
            "silent",
          );
        }}
        onDragEnd={(e) => {
          if (e.target !== stageRef.current) return;
          commitView({ zoom: getLiveView().zoom, pan: { x: e.target.x(), y: e.target.y() } });
        }}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
        onMouseUp={() => {
          if (!drawing) stageRef.current?.draggable(true);
        }}
        onTouchEnd={() => {
          if (!drawing) stageRef.current?.draggable(true);
        }}
      >
        {/* Layer A — static: background, grid, hall boundary */}
        <Layer listening={false}>
          {grid.bounds ? (
            <Rect
              x={grid.bounds.x}
              y={grid.bounds.y}
              width={grid.bounds.w}
              height={grid.bounds.h}
              fill={CANVAS_COLORS.pageBg}
              listening={false}
              perfectDrawEnabled={false}
            />
          ) : null}

          {grid.lines.map((pts, i) => (
            <Line
              key={i}
              points={pts}
              stroke={CANVAS_COLORS.grid}
              strokeWidth={1}
              strokeScaleEnabled={false}
              listening={false}
              perfectDrawEnabled={false}
            />
          ))}

          {boundary.shape === "circle" ? (
            <Ellipse
              x={boundary.x + boundary.width / 2}
              y={boundary.y + boundary.height / 2}
              radiusX={boundary.width / 2}
              radiusY={boundary.height / 2}
              fill={CANVAS_COLORS.hallFill}
              stroke={CANVAS_COLORS.hallStroke}
              strokeWidth={2}
              perfectDrawEnabled={false}
            />
          ) : boundary.shape === "polygon" ? (
            <Line
              points={boundaryPoints(boundary)}
              closed
              fill={CANVAS_COLORS.hallFill}
              stroke={CANVAS_COLORS.hallStroke}
              strokeWidth={2}
              perfectDrawEnabled={false}
            />
          ) : (
            <Rect
              x={boundary.x}
              y={boundary.y}
              width={boundary.width}
              height={boundary.height}
              fill={CANVAS_COLORS.hallFill}
              stroke={CANVAS_COLORS.hallStroke}
              strokeWidth={2}
              cornerRadius={4}
              perfectDrawEnabled={false}
            />
          )}
        </Layer>

        {/* Layer B — objects + seats (seats stay visible; painted cheaper) */}
        <Layer ref={objectsLayerRef}>
          {sortedObjects.map((o) => (
            <ObjectNode
              key={o.id}
              obj={o}
              mode={mode}
              gridSize={gridSize}
              snapToGrid={snapToGrid}
              selected={selectedIdSet.has(o.id)}
              valid={validity[o.id]?.valid ?? true}
              seats={seatsByTable?.[o.id]}
              highlighted={highlightTableId === o.id}
              canvas={CANVAS_COLORS}
              objectStyle={OBJECT_STYLE}
              enableShadows={enableShadows}
              onSelectObject={onSelectObject}
              onLive={stableOnLive}
              onCommit={stableOnCommit}
            />
          ))}
        </Layer>

        {/* Layer C — overlay: drawing, route, markers, transformer */}
        <Layer>
          {drawing && drawing.points.length > 0 && (
            <Line
              points={drawing.points}
              closed={drawing.mode === "polygon"}
              stroke={CANVAS_COLORS.selection}
              strokeWidth={2}
              strokeScaleEnabled={false}
              dash={[6, 4]}
              {...(drawing.mode === "polygon" ? { fill: "rgba(96,34,52,0.12)" } : {})}
            />
          )}

          {routePath && routePath.length > 1 && (
            <>
              <Line
                points={routePath.flatMap((p) => [p.x, p.y])}
                stroke={CANVAS_COLORS.selection}
                strokeWidth={6}
                strokeScaleEnabled={false}
                opacity={0.25}
                lineCap="round"
                lineJoin="round"
                listening={false}
                perfectDrawEnabled={false}
              />
              <Line
                points={routePath.flatMap((p) => [p.x, p.y])}
                stroke={CANVAS_COLORS.selection}
                strokeWidth={2.5}
                strokeScaleEnabled={false}
                dash={[10, 8]}
                lineCap="round"
                lineJoin="round"
                listening={false}
                perfectDrawEnabled={false}
              />
              <Circle
                x={routePath[0]!.x}
                y={routePath[0]!.y}
                radius={7 / Math.max(zoom, 0.01)}
                fill={CANVAS_COLORS.selection}
                listening={false}
                perfectDrawEnabled={false}
              />
            </>
          )}

          {seatMarker && (
            <>
              <Circle
                x={seatMarker.x}
                y={seatMarker.y}
                radius={16 / Math.max(zoom, 0.01)}
                fill={CANVAS_COLORS.seatTaken}
                opacity={0.25}
                listening={false}
                perfectDrawEnabled={false}
              />
              <Circle
                x={seatMarker.x}
                y={seatMarker.y}
                radius={7 / Math.max(zoom, 0.01)}
                fill={CANVAS_COLORS.seatTaken}
                stroke={CANVAS_COLORS.seatStroke}
                strokeWidth={1.5 / Math.max(zoom, 0.01)}
                listening={false}
                perfectDrawEnabled={false}
              />
            </>
          )}

          {mode === "edit" && (
            <Transformer
              ref={trRef}
              rotateEnabled
              flipEnabled={false}
              rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
              keepRatio={roundSelection}
              ignoreStroke
              enabledAnchors={[
                "top-left",
                "top-center",
                "top-right",
                "middle-left",
                "middle-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
              ]}
              anchorSize={Math.max(6, 8 / zoom)}
              anchorCornerRadius={2}
              borderStrokeWidth={Math.max(1, 1 / zoom)}
              anchorStrokeWidth={Math.max(1, 1 / zoom)}
              rotateAnchorOffset={Math.max(10, 14 / zoom)}
              padding={0}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
              }
              onTransformEnd={() => {
                if (!drawing) stageRef.current?.draggable(true);
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

function hitsTransformer(target: Konva.Node, stage: Konva.Stage): boolean {
  let node: Konva.Node | null = target;
  while (node && node !== stage) {
    if (node.getClassName() === "Transformer") return true;
    node = node.getParent();
  }
  return false;
}

function hitsObjectOrTransformer(target: Konva.Node, stage: Konva.Stage): boolean {
  let node: Konva.Node | null = target;
  while (node && node !== stage) {
    if (node.name() === "hall-object" || node.getClassName() === "Transformer") return true;
    node = node.getParent();
  }
  return false;
}

const ObjectNode = memo(function ObjectNode({
  obj,
  mode,
  gridSize,
  snapToGrid,
  selected,
  valid,
  seats,
  highlighted,
  canvas: CANVAS_COLORS,
  objectStyle: OBJECT_STYLE,
  enableShadows,
  onSelectObject,
  onLive,
  onCommit,
}: ObjectNodeProps) {
  const style = OBJECT_STYLE[obj.type] ?? OBJECT_STYLE["decoration"]!;
  const isTable = obj.type === "table";
  const hasSeatMap = Boolean(seats);
  const reserved = !hasSeatMap && (obj.reservedSeats ?? 0) > 0;
  const stroke = !valid
    ? CANVAS_COLORS.invalid
    : highlighted
      ? CANVAS_COLORS.selection
      : reserved && isTable
        ? CANVAS_COLORS.seatTaken
        : style.stroke;
  const fill = reserved && isTable ? CANVAS_COLORS.seatTakenFill : style.fill;
  const isRound = obj.tableShape === "round";
  const isWalkway = obj.type === "walkway" && obj.geometry !== "path";
  const drawn = obj.geometry === "polygon" || obj.geometry === "path";

  const localPoints =
    drawn && obj.points ? obj.points.flatMap((p) => [p.x - obj.x, p.y - obj.y]) : [];

  const seatPositions = isTable
    ? seatOffsets(obj.tableShape ?? "round", obj.width, obj.height, obj.capacity ?? 0)
    : [];

  const labelText = isWalkway ? "← → WALKWAY ← →" : isTable ? obj.label : obj.label.toUpperCase();
  const textFill = reserved && isTable ? CANVAS_COLORS.seatTakenStroke : style.text;
  const takenCount = seats
    ? seats.filter((s) => s.taken || s.guestName).length
    : (obj.reservedSeats ?? 0);

  const shadowProps = enableShadows
    ? {
        shadowColor: CANVAS_COLORS.selection,
        shadowOpacity: 0.18,
        shadowBlur: selected ? 10 : 4,
      }
    : { shadowEnabled: false as const };

  const handleSelect = useCallback(() => {
    onSelectObject(obj.id, isTable);
  }, [isTable, obj.id, onSelectObject]);

  // Fixed hit padding in view mode — avoids re-rendering every ObjectNode on zoom sync.
  const viewHitStroke = 32;

  return (
    <Group
      ref={(node) => {
        if (!node) return;
        // Transformer asks getClientRect({ skipTransform: true }) on the Group.
        // Delegating that flag to a child Rect skips the Rect's own x/y (−w/2, −h/2),
        // so the frame only covers a corner. Resolve the resize-box in group space instead.
        node.getClientRect = (config) => {
          const box = node.findOne(".resize-box");
          if (!box) {
            return Konva.Group.prototype.getClientRect.call(node, config);
          }
          if (config?.skipTransform) {
            return box.getClientRect({
              ...(config.skipShadow != null ? { skipShadow: config.skipShadow } : {}),
              ...(config.skipStroke != null ? { skipStroke: config.skipStroke } : {}),
              relativeTo: node,
            });
          }
          return box.getClientRect(config);
        };
      }}
      id={obj.id}
      name="hall-object"
      x={obj.x}
      y={obj.y}
      rotation={obj.rotation}
      draggable={mode === "edit"}
      onMouseDown={handleSelect}
      onTap={handleSelect}
      onDragMove={(e) => {
        const nx = snap(e.target.x(), gridSize, snapToGrid);
        const ny = snap(e.target.y(), gridSize, snapToGrid);
        e.target.position({ x: nx, y: ny });
        onLive?.(obj.id, { x: nx, y: ny });
      }}
      onDragEnd={(e) => onCommit?.(obj.id, { x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        const sx = node.scaleX();
        const sy = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        const scaleX = isRound ? Math.max(sx, sy) : sx;
        const scaleY = isRound ? Math.max(sx, sy) : sy;
        const width = Math.max(20, Math.round(obj.width * scaleX));
        const height = Math.max(20, Math.round(obj.height * scaleY));
        const x = Math.round(node.x());
        const y = Math.round(node.y());
        onCommit?.(obj.id, {
          x,
          y,
          width,
          height,
          rotation: Math.round(node.rotation()),
          ...(drawn && obj.points
            ? {
                points: obj.points.map((point) => ({
                  x: x + (point.x - obj.x) * (width / obj.width),
                  y: y + (point.y - obj.y) * (height / obj.height),
                })),
              }
            : {}),
        });
      }}
    >
      {drawn ? (
        obj.geometry === "path" ? (
          <Line
            name="resize-box"
            points={localPoints}
            closed={false}
            stroke={stroke}
            strokeWidth={14}
            dash={[18, 10]}
            lineCap="round"
            lineJoin="round"
            opacity={0.9}
            perfectDrawEnabled={false}
            {...shadowProps}
          />
        ) : (
          <Line
            name="resize-box"
            points={localPoints}
            closed={obj.geometry === "polygon"}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
            opacity={0.9}
            perfectDrawEnabled={false}
            {...shadowProps}
          />
        )
      ) : isRound ? (
        <Circle
          name="resize-box"
          radius={obj.width / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={selected || !valid ? 3 : 2}
          hitStrokeWidth={mode === "view" ? viewHitStroke : 0}
          perfectDrawEnabled={false}
          {...shadowProps}
        />
      ) : isWalkway || obj.type === "entrance" ? (
        <Rect
          name="resize-box"
          x={-obj.width / 2}
          y={-obj.height / 2}
          width={obj.width}
          height={obj.height}
          cornerRadius={isWalkway ? 8 : 16}
          fill={fill}
          stroke={stroke}
          strokeWidth={selected || !valid ? 3 : 2}
          dash={[10, 7]}
          perfectDrawEnabled={false}
          {...shadowProps}
        />
      ) : (
        <Rect
          name="resize-box"
          x={-obj.width / 2}
          y={-obj.height / 2}
          width={obj.width}
          height={obj.height}
          cornerRadius={isTable ? 10 : 6}
          fill={fill}
          stroke={stroke}
          strokeWidth={selected || !valid ? 3 : 1.5}
          hitStrokeWidth={mode === "view" && isTable ? viewHitStroke : 0}
          perfectDrawEnabled={false}
          {...shadowProps}
        />
      )}

      {/* All seats stay visible — cheaper paint flags only */}
      {seatPositions.map((p, i) => {
        const info = seats?.[i];
        const taken = Boolean(info?.taken || info?.guestName);
        return (
          <Circle
            key={i}
            x={p.x}
            y={p.y}
            radius={7}
            fill={taken ? CANVAS_COLORS.seatTaken : CANVAS_COLORS.seat}
            stroke={taken ? CANVAS_COLORS.seatTakenStroke : CANVAS_COLORS.seatStroke}
            strokeWidth={1}
            listening={false}
            perfectDrawEnabled={false}
            shadowEnabled={false}
          />
        );
      })}

      {!drawn && (
        <Text
          text={labelText}
          fontSize={Math.max(
            10,
            Math.min(isWalkway ? 12 : obj.type === "stage" ? 16 : 13, obj.width / 8),
          )}
          fontStyle="600"
          fill={textFill}
          width={obj.width}
          align="center"
          verticalAlign="middle"
          x={-obj.width / 2}
          y={isTable ? -8 : -7}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
      {isTable && (
        <Text
          text={`${takenCount}/${obj.capacity ?? 0}`}
          fontSize={11}
          fill={textFill}
          width={obj.width}
          align="center"
          x={-obj.width / 2}
          y={8}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
      {!valid && (
        <Text
          text="✕"
          fontSize={14}
          fill={CANVAS_COLORS.invalid}
          x={obj.width / 2 - 4}
          y={-obj.height / 2 - 16}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  );
}, objectNodePropsEqual);
