// Backend client. The Vite dev server proxies /api -> http://localhost:8123
// (see vite.config.ts), so these are same-origin in dev.
import type { Bin, Grid } from "./types";

// In dev, Vite proxies "/api" to the backend (vite.config.ts). In production the
// frontend (Vercel) and backend (Render) are different origins, so set
// VITE_API_BASE to the backend's base URL, e.g. https://gridfinity-api.onrender.com/api
const BASE = import.meta.env.VITE_API_BASE ?? "/api";

// Convert a frontend Bin to the backend BinSpec JSON shape.
function binToSpec(b: Bin) {
  return {
    id: b.id,
    x: b.x, y: b.y, w: b.w, d: b.d,
    height_u: b.heightU,
    compartments: { cols: b.comp.cols, rows: b.comp.rows },
    label: b.label, scoop: b.scoop,
    magnet_holes: b.magnetHoles, screw_holes: b.screwHoles,
  };
}

export interface GridComputeResult {
  cols: number; rows: number;
  plate_width_mm: number; plate_depth_mm: number;
  margin_x_mm: number; margin_y_mm: number;
}

export async function computeGrid(
  mode: "dimensions" | "units",
  args: { width_mm?: number; depth_mm?: number; cols?: number; rows?: number },
): Promise<GridComputeResult> {
  const res = await fetch(`${BASE}/grid/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, ...args }),
  });
  if (!res.ok) throw new Error("grid compute failed");
  return res.json();
}

export async function fetchBinStl(b: Bin): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE}/stl/bin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(binToSpec(b)),
  });
  if (!res.ok) throw new Error("bin stl failed");
  return res.arrayBuffer();
}

export async function fetchBaseplateStl(grid: Grid): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE}/stl/baseplate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cols: grid.cols, rows: grid.rows }),
  });
  if (!res.ok) throw new Error("baseplate stl failed");
  return res.arrayBuffer();
}

export async function exportZip(
  name: string,
  grid: Grid,
  bins: Bin[],
  includeBaseplate: boolean,
): Promise<Blob> {
  // Generated bins are built into STLs; imported community models are credited
  // only (CREDITS.md) — never rehosted.
  const realBins = bins.filter((b) => b.kind !== "model");
  const models = bins
    .filter((b) => b.kind === "model" && b.model)
    .map((b) => ({
      title: b.model!.title,
      author: b.model!.author,
      source_url: b.model!.sourceUrl,
      license: b.model!.license,
      width_u: b.w,
      depth_u: b.d,
    }));
  const res = await fetch(`${BASE}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      baseplate: { cols: grid.cols, rows: grid.rows },
      bins: realBins.map(binToSpec),
      include_baseplate: includeBaseplate,
      models,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`export failed: ${txt}`);
  }
  return res.blob();
}
