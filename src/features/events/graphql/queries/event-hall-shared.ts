export type EventHallCoordinateSystem = {
  width: number;
  height: number;
};

export type EventHallPointNode = {
  x: number;
  y: number;
};

export type EventHallBoundaryNode = {
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widthMeters?: number | null;
  heightMeters?: number | null;
  radius?: number | null;
  points?: EventHallPointNode[] | null;
};

export type EventHallTableTemplateNode = {
  id?: string | null;
  capacity: number;
  numberOfTables: number;
  seatNaming: string;
  tableNaming: string;
  tableShape: string;
  createdObjectCount?: number | null;
};

export type EventHallBoundaryInput = {
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widthMeters?: number | null;
  heightMeters?: number | null;
  radius?: number | null;
  points?: EventHallPointNode[] | null;
};

export type EventHallTableTemplateInput = {
  capacity: number;
  numberOfTables: number;
  seatNaming: string;
  tableNaming: string;
  tableShape: string;
};
