// Shared types — mirror of the backend's design-spec schema (schema.py).

export interface Compartments {
  cols: number;
  rows: number;
}

export interface Bin {
  id: string;
  x: number; // top-left cell column (0-based)
  y: number; // top-left cell row (0-based)
  w: number; // width in units
  d: number; // depth in units
  heightU: number; // height in U (7mm each)
  comp: Compartments;
  label: boolean;
  scoop: boolean;
  magnetHoles: boolean;
  screwHoles: boolean;
}

export interface Grid {
  cols: number;
  rows: number;
}

export type ViewMode = "2d" | "3d";
export type Step = "setup" | "design" | "export";
export type Tool = "select" | "add" | "pan";

// Gridfinity constants the UI renders against (kept in sync with constants.py).
export const GRID_UNIT = 42; // mm pitch
export const HEIGHT_UNIT = 7; // mm per U
