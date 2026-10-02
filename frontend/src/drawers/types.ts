// A common drawer with researched INTERIOR dimensions. Every entry cites the
// source its numbers came from; nothing here is estimated.

export type DrawerCategory = "furniture" | "tool-chest" | "case" | "office" | "kitchen";
export type SourceKind = "manufacturer" | "retailer" | "community-measured";

export interface DrawerPreset {
  id: string;
  brand: string;
  model: string;
  variant: string;
  category: DrawerCategory;
  regions: string[];
  inner: {
    width_mm: number; // side to side, inside
    depth_mm: number; // front to back, inside
    height_mm: number | null; // inside height, when the source states it
  };
  source_url: string;
  source_kind: SourceKind;
  confidence: "high" | "medium";
  notes: string;
}
