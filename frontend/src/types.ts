// Shared types — mirror of the backend's design-spec schema (schema.py).

export interface Compartments {
  cols: number;
  rows: number;
}

// A lightweight reference to a community model placed on the grid (imported
// from the catalog). We never rehost the STL — this just reserves the footprint
// and links back to the source for download, respecting its license.
export interface ModelRef {
  catalogId: string;
  title: string;
  author: string;
  source: string;
  sourceUrl: string;
  license: string;
  thumbnail: string | null;
}

export interface Bin {
  id: string;
  kind?: "bin" | "model"; // default "bin"; "model" = imported community model
  model?: ModelRef; // present when kind === "model"
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
  solid?: boolean; // solid lid/spacer — no cavity
  // when a real bin was generated from a community generator entry, remember it
  source?: { title: string; url: string; license: string };
}

/** The physical drawer the grid was sized for (all inner dimensions, mm). */
export interface DrawerSpec {
  widthMm: number;
  depthMm: number;
  heightMm: number | null; // inner height, when known — limits bin height
  presetId: string | null; // a common drawer from src/drawers, if one was picked
  label: string | null;
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
