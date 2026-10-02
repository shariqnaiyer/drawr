import raw from "./drawers.json";
import type { DrawerCategory, DrawerPreset } from "./types";

export type { DrawerCategory, DrawerPreset } from "./types";

export const DRAWER_CATEGORIES: { id: DrawerCategory; label: string }[] = [
  { id: "furniture", label: "Furniture" },
  { id: "tool-chest", label: "Tool chests" },
  { id: "case", label: "Cases" },
  { id: "office", label: "Office" },
  { id: "kitchen", label: "Kitchen" },
];

const CATEGORY_IDS = new Set(DRAWER_CATEGORIES.map((c) => c.id));
const SOURCE_KINDS = new Set(["manufacturer", "retailer", "community-measured"]);

// Plausible interior ranges. Anything outside is almost certainly a data error
// (outer dims, inches left unconverted, swapped fields) and is rejected.
export const LIMITS = {
  minSide: 42, // must hold at least one Gridfinity unit
  maxSide: 1500,
  minHeight: 10,
  maxHeight: 600,
};

/** Every problem with an entry, in plain words (empty = valid). */
export function validateDrawer(d: unknown): string[] {
  const p = d as DrawerPreset;
  const errs: string[] = [];
  if (!p || typeof p !== "object") return ["not an object"];
  if (typeof p.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) errs.push("id must be kebab-case");
  if (typeof p.brand !== "string" || !p.brand.trim()) errs.push("brand is required");
  if (typeof p.model !== "string" || !p.model.trim()) errs.push("model is required");
  if (typeof p.variant !== "string") errs.push("variant must be a string");
  if (!CATEGORY_IDS.has(p.category)) errs.push(`unknown category "${p.category}"`);
  if (!Array.isArray(p.regions)) errs.push("regions must be an array");
  const inner = p.inner;
  if (!inner || typeof inner !== "object") {
    errs.push("inner dimensions are required");
  } else {
    for (const k of ["width_mm", "depth_mm"] as const) {
      const v = inner[k];
      if (typeof v !== "number" || !Number.isFinite(v) || v < LIMITS.minSide || v > LIMITS.maxSide)
        errs.push(`${k} must be ${LIMITS.minSide}–${LIMITS.maxSide} mm`);
    }
    const h = inner.height_mm;
    if (h !== null && (typeof h !== "number" || !Number.isFinite(h) || h < LIMITS.minHeight || h > LIMITS.maxHeight))
      errs.push(`height_mm must be null or ${LIMITS.minHeight}–${LIMITS.maxHeight} mm`);
  }
  if (typeof p.source_url !== "string" || !/^https:\/\/\S+$/.test(p.source_url)) errs.push("source_url must be https");
  if (!SOURCE_KINDS.has(p.source_kind)) errs.push(`unknown source_kind "${p.source_kind}"`);
  if (p.confidence !== "high" && p.confidence !== "medium") errs.push("confidence must be high or medium");
  return errs;
}

/** Validated, de-duplicated presets, sorted for display. Bad rows are dropped. */
function load(rows: unknown[]): DrawerPreset[] {
  const seen = new Set<string>();
  const out: DrawerPreset[] = [];
  for (const row of rows) {
    const errs = validateDrawer(row);
    const p = row as DrawerPreset;
    if (errs.length || seen.has(p.id)) {
      if (import.meta.env.DEV) console.warn(`[drawers] skipped ${p?.id ?? "?"}:`, errs.join("; ") || "duplicate id");
      continue;
    }
    seen.add(p.id);
    out.push(p);
  }
  return out.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model) || a.variant.localeCompare(b.variant));
}

export const DRAWERS: DrawerPreset[] = load(raw as unknown[]);

export const drawerById = (id: string | null | undefined) => (id ? DRAWERS.find((d) => d.id === id) ?? null : null);

export const drawerLabel = (d: DrawerPreset) => `${d.brand} ${d.model}${d.variant ? ` · ${d.variant}` : ""}`;

// ---- search -------------------------------------------------------------------

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9.]+/g, " ").trim();

/** Is `q` a subsequence of `word` (cheap typo tolerance: "alx" ~ "alex")? */
function subseq(q: string, word: string) {
  let i = 0;
  for (const ch of word) if (ch === q[i]) i++;
  return i === q.length;
}

/**
 * Rank presets for a query. Every query token must match somewhere (prefix,
 * substring, or a ≥3-letter subsequence of one word); prefix hits on brand or
 * model rank highest.
 */
export function searchDrawers(query: string, opts: { category?: DrawerCategory | "all"; list?: DrawerPreset[] } = {}) {
  const list = (opts.list ?? DRAWERS).filter((d) => !opts.category || opts.category === "all" || d.category === opts.category);
  const tokens = norm(query).split(" ").filter(Boolean);
  if (!tokens.length) return list;

  const scored: { d: DrawerPreset; score: number }[] = [];
  for (const d of list) {
    const head = norm(`${d.brand} ${d.model}`);
    const all = norm(`${d.brand} ${d.model} ${d.variant} ${d.category} ${d.regions.join(" ")}`);
    const words = all.split(" ");
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      if (head.split(" ").some((w) => w.startsWith(t))) score += 3;
      else if (words.some((w) => w.startsWith(t))) score += 2;
      else if (all.includes(t)) score += 1;
      else if (t.length >= 3 && words.some((w) => w.length >= t.length && subseq(t, w))) score += 0.5;
      else {
        ok = false;
        break;
      }
    }
    if (ok) scored.push({ d, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.d);
}
