// The filament lineup — the only saturated color in drawr. Parts (bins) wear
// it; the interface never does. Used for the 2D canvas, the 3D preview and the
// landing page so a layout looks the same everywhere.

export interface Filament {
  id: FilamentId;
  name: string;
  face: string; // top face
  side: string; // shaded side / edge
  deep: string; // cavity / darkest shade
  ink: string; // readable text on the face
}

export type FilamentId = "graphite" | "cloud" | "blue" | "mint" | "sun" | "coral" | "lilac";

export const FILAMENTS: Filament[] = [
  { id: "graphite", name: "Graphite", face: "#4a4a50", side: "#38383d", deep: "#2b2b2f", ink: "#f2f2f5" },
  { id: "cloud", name: "Cloud", face: "#f4f4f6", side: "#dcdce2", deep: "#c9c9d1", ink: "#2c2c30" },
  { id: "blue", name: "Signal", face: "#3b74f6", side: "#2a5cd6", deep: "#1f47ad", ink: "#ffffff" },
  { id: "mint", name: "Mint", face: "#38c493", side: "#26a578", deep: "#1b845f", ink: "#08321f" },
  { id: "sun", name: "Sun", face: "#ffc53d", side: "#eda90f", deep: "#c98b00", ink: "#3d2a00" },
  { id: "coral", name: "Coral", face: "#ff6a55", side: "#e94e39", deep: "#c23a28", ink: "#ffffff" },
  { id: "lilac", name: "Lilac", face: "#a58bff", side: "#8a6cf0", deep: "#6d51d0", ink: "#ffffff" },
];

export const filament = (id: FilamentId): Filament =>
  FILAMENTS.find((f) => f.id === id) ?? FILAMENTS[0];
