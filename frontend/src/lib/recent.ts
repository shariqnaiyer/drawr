// Recently used drawer sizes, remembered per browser. Storage can be missing or
// throw (private mode, blocked site data), so every access is guarded and the
// feature degrades to "no recents".

export interface RecentSize {
  widthMm: number;
  depthMm: number;
  heightMm: number | null;
  presetId: string | null;
  label: string | null;
}

const KEY = "drawr:recent-sizes";
const MAX = 5;

function valid(r: unknown): r is RecentSize {
  const o = r as RecentSize;
  return !!o && typeof o.widthMm === "number" && o.widthMm > 0 && typeof o.depthMm === "number" && o.depthMm > 0;
}

export function loadRecent(): RecentSize[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(valid).slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function rememberSize(size: RecentSize) {
  try {
    const same = (r: RecentSize) =>
      Math.abs(r.widthMm - size.widthMm) < 0.05 && Math.abs(r.depthMm - size.depthMm) < 0.05 && r.heightMm === size.heightMm;
    const next = [size, ...loadRecent().filter((r) => !same(r))].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recents are a convenience only */
  }
}
