"use client";

import { create } from "zustand";

import type { HallObject } from "../types";

/**
 * Editor-only state. Kept completely separate from application/domain state so
 * the layout renderer can be reused (guest app, security app) without it.
 */
type DesignerState = {
  objects: HallObject[];
  past: HallObject[][];
  future: HallObject[][];
  selectedIds: string[];
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoom: number;
  pan: { x: number; y: number };
  dirty: boolean;
  drawing: null | {
    type: HallObject["type"];
    label: string;
    mode: "polygon" | "path";
    points: number[];
  };

  init: (objects: HallObject[]) => void;
  commit: (next: HallObject[]) => void;
  patchLive: (id: string, patch: Partial<HallObject>) => void;
  update: (id: string, patch: Partial<HallObject>) => void;
  add: (obj: HallObject) => void;
  remove: (ids: string[]) => void;
  select: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
  setView: (
    patch: Partial<Pick<DesignerState, "zoom" | "pan" | "showGrid" | "snapToGrid" | "gridSize">>,
  ) => void;
  startDrawing: (type: HallObject["type"], label: string, mode: "polygon" | "path") => void;
  addDrawPoint: (x: number, y: number) => void;
  finishDrawing: () => void;
  cancelDrawing: () => void;
  markSaved: () => void;
};

export const useDesigner = create<DesignerState>((set, get) => ({
  objects: [],
  past: [],
  future: [],
  selectedIds: [],
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
  zoom: 1,
  pan: { x: 0, y: 0 },
  dirty: false,
  drawing: null,

  init: (objects) =>
    set({ objects, past: [], future: [], selectedIds: [], dirty: false, drawing: null }),

  commit: (next) =>
    set((s) => ({
      past: [...s.past, s.objects].slice(-60),
      objects: next,
      future: [],
      dirty: true,
    })),

  patchLive: (id, patch) =>
    set((s) => ({ objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),

  update: (id, patch) =>
    get().commit(get().objects.map((o) => (o.id === id ? { ...o, ...patch } : o))),

  add: (obj) => {
    get().commit([...get().objects, obj]);
    set({ selectedIds: [obj.id] });
  },

  remove: (ids) => {
    get().commit(get().objects.filter((o) => !ids.includes(o.id)));
    set({ selectedIds: [] });
  },

  select: (ids) => set({ selectedIds: ids }),

  undo: () =>
    set((s) => {
      if (!s.past.length) return s;
      const prev = s.past[s.past.length - 1]!;
      return {
        objects: prev,
        past: s.past.slice(0, -1),
        future: [s.objects, ...s.future],
        dirty: true,
        selectedIds: [],
      };
    }),

  redo: () =>
    set((s) => {
      if (!s.future.length) return s;
      const next = s.future[0]!;
      return {
        objects: next,
        past: [...s.past, s.objects],
        future: s.future.slice(1),
        dirty: true,
        selectedIds: [],
      };
    }),

  setView: (patch) => set(patch),

  startDrawing: (type, label, mode) =>
    set({ drawing: { type, label, mode, points: [] }, selectedIds: [] }),

  addDrawPoint: (x, y) =>
    set((s) =>
      s.drawing ? { drawing: { ...s.drawing, points: [...s.drawing.points, x, y] } } : s,
    ),

  cancelDrawing: () => set({ drawing: null }),

  finishDrawing: () => {
    const d = get().drawing;
    set({ drawing: null });
    if (!d) return;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < d.points.length; i += 2) pts.push({ x: d.points[i]!, y: d.points[i + 1]! });
    const min = d.mode === "polygon" ? 3 : 2;
    if (pts.length < min) return;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    get().add({
      id: `obj-${Math.random().toString(36).slice(2, 9)}`,
      type: d.type,
      label: d.label,
      x: cx,
      y: cy,
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      rotation: 0,
      zIndex: 1,
      geometry: d.mode,
      points: pts,
    });
  },

  markSaved: () => set({ dirty: false }),
}));
