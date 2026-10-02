// Length parsing/formatting for the Setup fields. Everything is stored in mm;
// inches are a display/input convenience only.

export type LengthUnit = "mm" | "in";
export const MM_PER_IN = 25.4;

/**
 * Parse a user-typed length into millimetres, or null if it isn't one.
 * Accepts plain decimals ("300", "11.75", "11,75") and, for inches, mixed
 * fractions ("11 3/4", "11-3/4", "3/4") plus a trailing unit mark (", in, mm).
 */
export function parseLength(raw: string, unit: LengthUnit): number | null {
  let s = raw.trim().toLowerCase().replace(/,/g, ".");
  s = s.replace(/(mm|in(ches)?|"|”|″)$/, "").trim();
  if (!s) return null;

  let value: number | null = null;
  const mixed = s.match(/^(\d+(?:\.\d+)?)(?:\s+|-)(\d+)\/(\d+)$/); // 11 3/4, 11-3/4
  const frac = s.match(/^(\d+)\/(\d+)$/); // 3/4
  if (mixed) {
    const den = Number(mixed[3]);
    if (den > 0) value = Number(mixed[1]) + Number(mixed[2]) / den;
  } else if (frac) {
    const den = Number(frac[2]);
    if (den > 0) value = Number(frac[1]) / den;
  } else if (/^\d*\.?\d+$/.test(s)) {
    value = Number(s);
  }
  if (value === null || !Number.isFinite(value) || value <= 0) return null;
  return unit === "in" ? value * MM_PER_IN : value;
}

/** Format millimetres for an input field in the given unit (no unit suffix). */
export function formatLength(mm: number, unit: LengthUnit): string {
  if (unit === "mm") return String(Math.round(mm * 10) / 10);
  return String(Math.round((mm / MM_PER_IN) * 100) / 100);
}
