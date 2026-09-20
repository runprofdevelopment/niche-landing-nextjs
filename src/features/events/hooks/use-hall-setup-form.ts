"use client";

import { useCallback, useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/shared/components/feedback/toast";

import { defaultBoundary } from "../domain/boundary";
import { TABLE_PRESETS } from "../domain/catalog";
import { fitMetersToWorkspace, legacyUnitsToMeters } from "../domain/coordinate-system";
import { librarySeatCapacity } from "../domain/table-templates";
import { uid } from "../utils/uid";

import type {
  BoundaryShape,
  Hall,
  HallBoundary,
  HallType,
  Point,
  TableShape,
  TableTemplate,
} from "../types";

function resolveHallType(eventType: string): HallType {
  return eventType === "dining" ? "dining" : "wedding";
}

export type NamingStrategy = "numeric" | "alphabetical";

function asNaming(value: string | null | undefined): NamingStrategy {
  return value === "alphabetical" ? "alphabetical" : "numeric";
}

export type TableConfigRow = {
  id: string;
  capacity: number;
  quantity: number;
  shape: TableShape;
  tableNaming: NamingStrategy;
  seatNaming: NamingStrategy;
  createdObjectCount: number;
};

function resolveMeters(hall: Hall | undefined): {
  widthMeters: number;
  heightMeters: number;
  radiusMeters: number;
} {
  if (!hall) {
    return { widthMeters: 30, heightMeters: 30, radiusMeters: 15 };
  }

  const widthMeters =
    hall.boundary.widthMeters != null && hall.boundary.widthMeters > 0
      ? hall.boundary.widthMeters
      : legacyUnitsToMeters(hall.boundary.width);
  const heightMeters =
    hall.boundary.heightMeters != null && hall.boundary.heightMeters > 0
      ? hall.boundary.heightMeters
      : legacyUnitsToMeters(hall.boundary.height);
  const radiusMeters =
    hall.boundary.shape === "circle"
      ? hall.boundary.widthMeters != null && hall.boundary.widthMeters > 0
        ? hall.boundary.widthMeters / 2
        : legacyUnitsToMeters(hall.boundary.width / 2)
      : 15;

  return { widthMeters, heightMeters, radiusMeters };
}

function defaultTableRows(): TableConfigRow[] {
  return [
    {
      id: uid("row"),
      capacity: 8,
      quantity: 4,
      shape: "round",
      tableNaming: "numeric",
      seatNaming: "numeric",
      createdObjectCount: 0,
    },
    {
      id: uid("row"),
      capacity: 10,
      quantity: 5,
      shape: "rectangle",
      tableNaming: "numeric",
      seatNaming: "numeric",
      createdObjectCount: 0,
    },
    {
      id: uid("row"),
      capacity: 4,
      quantity: 3,
      shape: "square",
      tableNaming: "numeric",
      seatNaming: "numeric",
      createdObjectCount: 0,
    },
  ];
}

function templateToRow(template: TableTemplate): TableConfigRow {
  return {
    id: template.id,
    capacity: template.capacity,
    quantity: template.quantity,
    shape: template.shape,
    tableNaming: asNaming(template.tableNaming),
    seatNaming: asNaming(template.seatNaming),
    createdObjectCount: template.createdObjectCount ?? 0,
  };
}

function rowToTemplate(row: TableConfigRow, label: string): TableTemplate {
  const preset = TABLE_PRESETS[row.shape];
  const seatNaming = asNaming(row.seatNaming);
  return {
    id: row.id.startsWith("row-") || row.id.startsWith("tpl-") ? row.id : uid("tpl"),
    name: label,
    shape: row.shape,
    capacity: row.capacity,
    quantity: row.quantity,
    width: preset.width,
    height: preset.height,
    tableNaming: asNaming(row.tableNaming),
    seatNaming,
    createdObjectCount: row.createdObjectCount,
  };
}

type HallSetupInit = {
  hall?: Hall | undefined;
  defaultCapacityLimit: number;
};

export function useHallSetupForm({ hall, defaultCapacityLimit }: HallSetupInit) {
  const t = useTranslations("events");
  const initialShape = hall?.boundary.shape ?? "square";
  const initialMeters = resolveMeters(hall);

  const [shape, setShape] = useState<BoundaryShape>(initialShape);
  const [widthMeters, setWidthMeters] = useState(initialMeters.widthMeters);
  const [heightMeters, setHeightMeters] = useState(initialMeters.heightMeters);
  const [radiusMeters, setRadiusMeters] = useState(initialMeters.radiusMeters);
  const [hallName, setHallName] = useState(hall?.name ?? "Main Hall");
  const [eventType, setEventType] = useState(hall?.eventType ?? hall?.hallType ?? "wedding");
  const capacityLimit = defaultCapacityLimit;

  const [polygonPoints, setPolygonPoints] = useState<Point[]>(hall?.boundary.points ?? []);
  const [polygonHistory, setPolygonHistory] = useState<Point[][]>([hall?.boundary.points ?? []]);
  const [polygonHistoryIndex, setPolygonHistoryIndex] = useState(0);
  const [polygonClosed, setPolygonClosed] = useState(Boolean(hall?.boundary.points?.length));

  const [tableRows, setTableRows] = useState<TableConfigRow[]>(() =>
    hall?.tableTemplates.length ? hall.tableTemplates.map(templateToRow) : defaultTableRows(),
  );

  const logicalDims = useMemo(() => {
    if (shape === "circle") {
      const diameterM = Math.max(0.1, radiusMeters * 2);
      return fitMetersToWorkspace(diameterM, diameterM);
    }
    const wM = Math.max(0.1, widthMeters);
    const hM = Math.max(0.1, shape === "square" ? widthMeters : heightMeters);
    return fitMetersToWorkspace(wM, hM);
  }, [heightMeters, radiusMeters, shape, widthMeters]);

  const templates = useMemo(
    () =>
      tableRows
        .filter((row) => row.quantity > 0)
        .map((row) => rowToTemplate(row, TABLE_PRESETS[row.shape].label)),
    [tableRows],
  );

  const totalTables = useMemo(
    () => tableRows.reduce((sum, row) => sum + row.quantity, 0),
    [tableRows],
  );
  const totalSeats = useMemo(() => librarySeatCapacity(templates), [templates]);
  const remainingCapacity = Math.max(0, capacityLimit - totalSeats);

  const pushPolygonHistory = useCallback(
    (nextPoints: Point[]) => {
      setPolygonHistory((history) => {
        const trimmed = history.slice(0, polygonHistoryIndex + 1);
        return [...trimmed, nextPoints];
      });
      setPolygonHistoryIndex((index) => index + 1);
      setPolygonPoints(nextPoints);
    },
    [polygonHistoryIndex],
  );

  const addPolygonPoint = useCallback(
    (point: Point) => {
      if (polygonClosed) return;

      if (polygonPoints.length >= 3) {
        const first = polygonPoints[0];
        if (first && Math.hypot(point.x - first.x, point.y - first.y) < 24) {
          pushPolygonHistory([...polygonPoints]);
          setPolygonClosed(true);
          return;
        }
      }

      pushPolygonHistory([...polygonPoints, point]);
    },
    [polygonClosed, polygonPoints, pushPolygonHistory],
  );

  const undoPolygon = useCallback(() => {
    if (polygonHistoryIndex <= 0) return;
    const nextIndex = polygonHistoryIndex - 1;
    setPolygonHistoryIndex(nextIndex);
    setPolygonPoints(polygonHistory[nextIndex] ?? []);
    setPolygonClosed(false);
  }, [polygonHistory, polygonHistoryIndex]);

  const redoPolygon = useCallback(() => {
    if (polygonHistoryIndex >= polygonHistory.length - 1) return;
    const nextIndex = polygonHistoryIndex + 1;
    setPolygonHistoryIndex(nextIndex);
    setPolygonPoints(polygonHistory[nextIndex] ?? []);
  }, [polygonHistory, polygonHistoryIndex]);

  const clearPolygon = useCallback(() => {
    pushPolygonHistory([]);
    setPolygonClosed(false);
  }, [pushPolygonHistory]);

  const confirmPolygon = useCallback(() => {
    if (polygonPoints.length >= 3) setPolygonClosed(true);
  }, [polygonPoints.length]);

  const addTableRow = useCallback(() => {
    const used = tableRows.reduce((sum, row) => sum + row.capacity * row.quantity, 0);
    const remaining = capacityLimit - used;
    const nextCapacity = 8;
    if (remaining < nextCapacity) {
      toast.error(t("cannotAddTable"));
      return;
    }
    setTableRows((rows) => [
      ...rows,
      {
        id: uid("row"),
        capacity: nextCapacity,
        quantity: 1,
        shape: "round" as const,
        tableNaming: "numeric" as const,
        seatNaming: "numeric" as const,
        createdObjectCount: 0,
      },
    ]);
  }, [capacityLimit, t, tableRows]);

  const updateTableRow = useCallback(
    (id: string, patch: Partial<TableConfigRow>) => {
      const row = tableRows.find((entry) => entry.id === id);
      if (!row) return;

      // Placed hall objects lock shape + capacity; only quantity may grow.
      if (row.createdObjectCount > 0) {
        if (patch.capacity != null && patch.capacity !== row.capacity) {
          toast.error(t("cannotEditPlacedTemplate"));
          return;
        }
        if (patch.shape != null && patch.shape !== row.shape) {
          toast.error(t("cannotEditPlacedTemplate"));
          return;
        }
      }

      const next = { ...row, ...patch };
      const minQuantity = row.createdObjectCount;
      if (next.quantity < minQuantity) next.quantity = minQuantity;
      const otherSeats = tableRows
        .filter((entry) => entry.id !== id)
        .reduce((sum, entry) => sum + entry.capacity * entry.quantity, 0);
      const maxSeats = Math.max(0, capacityLimit - otherSeats);
      const nextSeats = next.capacity * next.quantity;
      const currentSeats = row.capacity * row.quantity;
      if (nextSeats > maxSeats && nextSeats > currentSeats) {
        toast.error(t("cannotIncreaseCapacity"));
        return;
      }
      setTableRows((rows) => rows.map((entry) => (entry.id === id ? next : entry)));
    },
    [capacityLimit, t, tableRows],
  );

  const removeTableRow = useCallback((id: string) => {
    setTableRows((rows) => {
      const target = rows.find((row) => row.id === id);
      if (!target || target.createdObjectCount > 0) return rows;
      return rows.length <= 1 ? rows : rows.filter((row) => row.id !== id);
    });
  }, []);

  const buildBoundary = useCallback((): HallBoundary | null => {
    const physicalWidthM =
      shape === "circle" ? Math.max(0.1, radiusMeters * 2) : Math.max(0.1, widthMeters);
    const physicalHeightM =
      shape === "circle"
        ? physicalWidthM
        : Math.max(0.1, shape === "square" ? widthMeters : heightMeters);

    if (shape === "polygon") {
      if (polygonPoints.length < 3) return null;
      return {
        ...defaultBoundary(shape, polygonPoints, {
          width: logicalDims.width,
          height: logicalDims.height,
          radius: logicalDims.width / 2,
        }),
        widthMeters: physicalWidthM,
        heightMeters: physicalHeightM,
      };
    }

    return {
      ...defaultBoundary(shape, [], {
        width: logicalDims.width,
        height: logicalDims.height,
        radius: logicalDims.width / 2,
      }),
      widthMeters: physicalWidthM,
      heightMeters: physicalHeightM,
    };
  }, [
    heightMeters,
    logicalDims.height,
    logicalDims.width,
    polygonPoints,
    radiusMeters,
    shape,
    widthMeters,
  ]);

  const canSave = shape !== "polygon" || (polygonClosed && polygonPoints.length >= 3);

  return {
    shape,
    setShape,
    widthMeters,
    setWidthMeters,
    heightMeters,
    setHeightMeters,
    radiusMeters,
    setRadiusMeters,
    hallName,
    setHallName,
    eventType,
    setEventType: (next: string) => {
      setEventType(next);
    },
    hallType: resolveHallType(eventType),
    capacityLimit,
    polygonPoints,
    polygonClosed,
    addPolygonPoint,
    undoPolygon,
    redoPolygon,
    clearPolygon,
    confirmPolygon,
    canUndo: polygonHistoryIndex > 0,
    canRedo: polygonHistoryIndex < polygonHistory.length - 1,
    tableRows,
    addTableRow,
    updateTableRow,
    removeTableRow,
    totalTables,
    totalSeats,
    remainingCapacity,
    templates,
    buildBoundary,
    canSave,
  };
}
