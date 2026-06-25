// A catalog entry — mirrors gridfinity-model-catalog/schema.json.
export interface CatalogModel {
  id: string;
  title: string;
  author: string;
  authorUrl: string | null;
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string | null;
  thumbnail: string | null;
  tags: string[];
  category: string;
  footprint: {
    widthU: number | null;
    depthU: number | null;
    heightU: number | null;
    raw: string | null;
    confidence: "high" | "low" | "none";
  };
  redistributable: boolean;
  attributionRequired: boolean;
  notes: string | null;
  // True for generators / multi-size collections with no single footprint —
  // the user picks the size on import.
  parametric?: boolean;
}
