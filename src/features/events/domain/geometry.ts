import type { HallBoundary, HallObject, Point, Seat, TableShape } from "../types";

export const SEAT_OFFSET = 16;
export const SEAT_RADIUS = 9;

export function rotatePoint(p: Point, origin: Point, deg: number): Point {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return { x: origin.x + dx * cos - dy * sin, y: origin.y + dx * sin + dy * cos };
}

/** Point on the perimeter of a w x h rectangle centered at origin, t in [0,1). */
function rectPerimeterPoint(t: number, w: number, h: number): Point {
  const per = 2 * (w + h);
  let d = ((t % 1) + 1) % 1;
  d *= per;
  if (d < w) return { x: -w / 2 + d, y: -h / 2 };
  d -= w;
  if (d < h) return { x: w / 2, y: -h / 2 + d };
  d -= h;
  if (d < w) return { x: w / 2 - d, y: h / 2 };
  d -= w;
  return { x: -w / 2, y: h / 2 - d };
}

/** Seat offsets relative to the (unrotated) table center, in logical units. */
export function seatOffsets(shape: TableShape, w: number, h: number, capacity: number): Point[] {
  const out: Point[] = [];
  if (capacity <= 0) return out;
  if (shape === "round") {
    const r = Math.max(w, h) / 2 + SEAT_OFFSET;
    for (let i = 0; i < capacity; i++) {
      const a = (i / capacity) * Math.PI * 2 - Math.PI / 2;
      out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    return out;
  }
  const ow = w + SEAT_OFFSET * 2;
  const oh = h + SEAT_OFFSET * 2;
  for (let i = 0; i < capacity; i++) {
    out.push(rectPerimeterPoint((i + 0.5) / capacity, ow, oh));
  }
  return out;
}

/** Derive absolute seats for a table object. Seats always follow the table. */
export function seatsForTable(table: HallObject): Seat[] {
  if (table.type !== "table" || !table.capacity) return [];
  const offsets = seatOffsets(
    table.tableShape ?? "round",
    table.width,
    table.height,
    table.capacity,
  );
  return offsets.map((o, i) => {
    const p = rotatePoint(
      { x: table.x + o.x, y: table.y + o.y },
      { x: table.x, y: table.y },
      table.rotation,
    );
    return {
      id: `${table.id}-seat-${i + 1}`,
      tableId: table.id,
      number: i + 1,
      x: p.x,
      y: p.y,
      rotation: table.rotation,
    };
  });
}

/** Rotation-aware corners of a box object. */
export function objectCorners(o: HallObject): Point[] {
  const hw = o.width / 2;
  const hh = o.height / 2;
  const raw = [
    { x: o.x - hw, y: o.y - hh },
    { x: o.x + hw, y: o.y - hh },
    { x: o.x + hw, y: o.y + hh },
    { x: o.x - hw, y: o.y + hh },
  ];
  return raw.map((p) => rotatePoint(p, { x: o.x, y: o.y }, o.rotation));
}

export function boundsOf(o: HallObject) {
  const c = objectCorners(o);
  const xs = c.map((p) => p.x);
  const ys = c.map((p) => p.y);
  return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
}

export function boxesOverlap(a: HallObject, b: HallObject, pad = 0) {
  const A = boundsOf(a);
  const B = boundsOf(b);
  return A.x1 < B.x2 + pad && A.x2 + pad > B.x1 && A.y1 < B.y2 + pad && A.y2 + pad > B.y1;
}

export function pointInPolygon(p: Point, poly: Point[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

export function pointInBoundary(p: Point, b: HallBoundary) {
  if (b.shape === "circle") {
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const rx = b.width / 2;
    const ry = b.height / 2;
    return ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2 <= 1;
  }
  if (b.shape === "polygon" && b.points && b.points.length > 2) {
    return pointInPolygon(p, b.points);
  }
  return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;
}

export function objectInsideBoundary(o: HallObject, b: HallBoundary) {
  return objectCorners(o).every((c) => pointInBoundary(c, b));
}

/** Types tables must never overlap. */
const BLOCKING_TYPES = new Set([
  "stage",
  "entrance",
  "exit",
  "restricted",
  "dance-floor",
  "buffet",
  "dj",
  "screen",
]);

export type Validation = { valid: boolean; reason?: string };

export function validatePlacement(
  obj: HallObject,
  all: HallObject[],
  boundary: HallBoundary,
): Validation {
  if (obj.geometry === "polygon" || obj.geometry === "path") return { valid: true };
  if (!objectInsideBoundary(obj, boundary)) {
    return { valid: false, reason: "Outside the hall boundary" };
  }
  if (obj.type !== "table") return { valid: true };

  for (const other of all) {
    if (other.id === obj.id) continue;
    if (other.geometry === "polygon" || other.geometry === "path") continue;
    if (other.type === "table" && boxesOverlap(obj, other, 8)) {
      return { valid: false, reason: `Overlaps ${other.label}` };
    }
    if (
      BLOCKING_TYPES.has(other.type) &&
      boxesOverlap(obj, other, other.type === "entrance" || other.type === "exit" ? 24 : 0)
    ) {
      return {
        valid: false,
        reason:
          other.type === "entrance" || other.type === "exit"
            ? `Blocks the ${other.label}`
            : `Overlaps ${other.label}`,
      };
    }
  }
  return { valid: true };
}

export function snap(value: number, size: number, enabled: boolean) {
  return enabled ? Math.round(value / size) * size : value;
}

export function totalSeatingCapacity(objects: HallObject[]) {
  return objects.reduce((sum, o) => sum + (o.type === "table" ? (o.capacity ?? 0) : 0), 0);
}

const WALKABLE_TYPES = new Set(["walkway", "dining", "vip", "photo-area"]);

function isBlocked(p: Point, objects: HallObject[], pad: number) {
  for (const o of objects) {
    if (o.geometry === "polygon" || o.geometry === "path") continue;
    if (WALKABLE_TYPES.has(o.type)) continue;
    const b = boundsOf(o);
    if (p.x > b.x1 - pad && p.x < b.x2 + pad && p.y > b.y1 - pad && p.y < b.y2 + pad) return true;
  }
  return false;
}

function simplify(path: Point[]): Point[] {
  if (path.length < 3) return path;
  const out: Point[] = [path[0]!];
  for (let i = 1; i < path.length - 1; i++) {
    const a = out[out.length - 1]!;
    const b = path[i]!;
    const c = path[i + 1]!;
    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    if (Math.abs(cross) > 1) out.push(b);
  }
  out.push(path[path.length - 1]!);
  return out;
}

export function routeToSeat(
  from: Point,
  to: Point,
  objects: HallObject[],
  boundary: HallBoundary,
  cell = 20,
): Point[] {
  const originX = boundary.x;
  const originY = boundary.y;
  const cols = Math.max(2, Math.ceil(boundary.width / cell));
  const rows = Math.max(2, Math.ceil(boundary.height / cell));
  const toPoint = (cx: number, cy: number): Point => ({
    x: originX + cx * cell + cell / 2,
    y: originY + cy * cell + cell / 2,
  });
  const toCell = (p: Point) => ({
    cx: Math.min(cols - 1, Math.max(0, Math.floor((p.x - originX) / cell))),
    cy: Math.min(rows - 1, Math.max(0, Math.floor((p.y - originY) / cell))),
  });

  const blocked = new Uint8Array(cols * rows);
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const p = toPoint(cx, cy);
      blocked[cy * cols + cx] = !pointInBoundary(p, boundary) || isBlocked(p, objects, 4) ? 1 : 0;
    }
  }

  const start = toCell(from);
  const goal = toCell(to);
  const startIdx = start.cy * cols + start.cx;
  const goalIdx = goal.cy * cols + goal.cx;
  blocked[startIdx] = 0;
  blocked[goalIdx] = 0;

  const prev = new Int32Array(cols * rows).fill(-1);
  const seen = new Uint8Array(cols * rows);
  const queue: number[] = [startIdx];
  seen[startIdx] = 1;
  let head = 0;
  let found = false;
  while (head < queue.length) {
    const cur = queue[head++]!;
    if (cur === goalIdx) {
      found = true;
      break;
    }
    const cx = cur % cols;
    const cy = (cur - cx) / cols;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const ni = ny * cols + nx;
      if (seen[ni] || blocked[ni]) continue;
      seen[ni] = 1;
      prev[ni] = cur;
      queue.push(ni);
    }
  }
  if (!found) return [];

  const cells: Point[] = [];
  for (let i = goalIdx; i !== -1; i = prev[i]!) {
    cells.push(toPoint(i % cols, (i - (i % cols)) / cols));
    if (i === startIdx) break;
  }
  cells.reverse();
  return simplify([from, ...cells, to]);
}
