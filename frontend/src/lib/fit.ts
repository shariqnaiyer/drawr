// Vertical fit: will a bin clear the drawer's inner height?
//
// A seated bin's foot bottoms out on the baseplate floor, so the stack rises
// BASEPLATE_FLOOR + heightU × 7 mm above the drawer bottom. Bin height already
// includes the stacking lip (backend geometry.py: total_h = height_u × 7).
// Keep these in sync with backend/app/constants.py.
import { HEIGHT_UNIT } from "../types";

export const BASEPLATE_FLOOR_MM = 1.2; // constants.BASEPLATE_FLOOR_THICKNESS
export const DRAWER_CLEARANCE_MM = 1.0; // headroom so the drawer above doesn't scrape
export const MIN_BIN_U = 2;
export const MAX_BIN_U = 20;

/** Height of a seated bin's top above the drawer floor, in mm. */
export function stackHeightMm(heightU: number) {
  return BASEPLATE_FLOOR_MM + heightU * HEIGHT_UNIT;
}

/** Tallest bin (in U) that fits under an inner drawer height, or null if unknown. */
export function maxBinU(innerHeightMm: number | null | undefined): number | null {
  if (innerHeightMm == null || !Number.isFinite(innerHeightMm) || innerHeightMm <= 0) return null;
  const u = Math.floor((innerHeightMm - BASEPLATE_FLOOR_MM - DRAWER_CLEARANCE_MM) / HEIGHT_UNIT);
  return Math.min(MAX_BIN_U, Math.max(0, u));
}
