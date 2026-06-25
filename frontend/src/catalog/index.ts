import rawModels from "./models.json";
import type { CatalogModel } from "./types";

export type { CatalogModel } from "./types";

// The bundled catalog (synced from the gridfinity-model-catalog repo via
// `npm run sync:catalog`). Indexing + linking only — STLs are never rehosted.
export const MODELS = rawModels as CatalogModel[];

export const CATEGORIES = [
  "all", "bins", "baseplates", "holders", "tools", "organization", "generators", "misc",
] as const;
export type Category = (typeof CATEGORIES)[number];

// ---- license presentation -------------------------------------------------
export interface LicenseInfo {
  label: string;
  tone: "ok" | "attribution" | "noncommercial" | "restricted";
  nonCommercial: boolean;
  noDerivatives: boolean;
}

export function licenseInfo(license: string): LicenseInfo {
  const nc = license.includes("NC");
  const nd = license.includes("ND");
  let tone: LicenseInfo["tone"] = "ok";
  if (license === "Unknown" || license === "Proprietary" || nd) tone = "restricted";
  else if (nc) tone = "noncommercial";
  else if (license.startsWith("CC-BY") || license === "MIT" || license === "GPL-3.0" || license === "BSD-3-Clause") tone = "attribution";
  if (license === "CC0-1.0") tone = "ok";
  return {
    label: license === "Unknown" ? "License unknown" : license,
    tone,
    nonCommercial: nc,
    noDerivatives: nd,
  };
}

// ---- search ---------------------------------------------------------------
export interface SearchOpts {
  category?: Category;
  /** Only models that fit within these remaining grid dimensions (units). */
  maxW?: number;
  maxD?: number;
  /** Hide models we can't legally redistribute? (always link-out regardless). */
}

export function searchCatalog(query: string, opts: SearchOpts = {}): CatalogModel[] {
  const q = query.trim().toLowerCase();
  return MODELS.filter((m) => {
    if (opts.category && opts.category !== "all" && m.category !== opts.category) return false;
    if (opts.maxW != null && m.footprint.widthU != null && m.footprint.widthU > opts.maxW) return false;
    if (opts.maxD != null && m.footprint.depthU != null && m.footprint.depthU > opts.maxD) return false;
    if (!q) return true;
    const hay = (m.title + " " + m.author + " " + m.tags.join(" ") + " " + m.category).toLowerCase();
    return hay.includes(q);
  });
}
