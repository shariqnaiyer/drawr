import { create } from "zustand";
import type { Bin, Grid, ModelRef, Step, Tool, ViewMode } from "./types";

let _id = 0;
const newId = () => `bin_${Date.now().toString(36)}_${_id++}`;

// ---- placement geometry helpers -------------------------------------------

/** Does a w x d bin at (x,y) fit on the grid without leaving the bounds? */
export function inBounds(grid: Grid, x: number, y: number, w: number, d: number) {
  return x >= 0 && y >= 0 && x + w <= grid.cols && y + d <= grid.rows;
}

/** Does a candidate footprint overlap any existing bin (excluding `ignoreId`)? */
export function overlaps(
  bins: Bin[],
  x: number,
  y: number,
  w: number,
  d: number,
  ignoreId?: string,
) {
  for (const b of bins) {
    if (b.id === ignoreId) continue;
    if (x < b.x + b.w && x + w > b.x && y < b.y + b.d && y + d > b.y) return true;
  }
  return false;
}

export function canPlace(
  grid: Grid,
  bins: Bin[],
  x: number,
  y: number,
  w: number,
  d: number,
  ignoreId?: string,
) {
  return inBounds(grid, x, y, w, d) && !overlaps(bins, x, y, w, d, ignoreId);
}

function makeBin(x: number, y: number, w: number, d: number): Bin {
  return {
    id: newId(),
    x, y, w, d,
    heightU: 6,
    comp: { cols: 1, rows: 1 },
    label: true,
    scoop: true,
    magnetHoles: true,
    screwHoles: false,
  };
}

interface State {
  // grid setup
  grid: Grid;
  // layout
  bins: Bin[];
  selectedId: string | null;
  // UI
  step: Step;
  view: ViewMode;
  tool: Tool;
  pendingFootprint: { w: number; d: number };
  zoom: number;
  // history
  past: Bin[][];
  future: Bin[][];

  // actions
  setGrid: (g: Grid) => void;
  setStep: (s: Step) => void;
  setView: (v: ViewMode) => void;
  setTool: (t: Tool) => void;
  setPendingFootprint: (w: number, d: number) => void;
  setZoom: (z: number) => void;
  select: (id: string | null) => void;
  addBin: (x: number, y: number, w: number, d: number) => void;
  addModel: (x: number, y: number, w: number, d: number, model: ModelRef, heightU: number) => void;
  updateBin: (id: string, patch: Partial<Bin>) => void;
  moveBin: (id: string, x: number, y: number) => void;
  resizeBin: (id: string, w: number, d: number) => void;
  deleteBin: (id: string) => void;
  duplicateBin: (id: string) => void;
  applyToAll: (id: string) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
}

export const useStore = create<State>((set, get) => {
  // snapshot current bins onto the undo stack before a mutation
  const snapshot = () =>
    set((s) => ({ past: [...s.past, s.bins.map((b) => ({ ...b }))], future: [] }));

  return {
    grid: { cols: 7, rows: 5 },
    bins: [],
    selectedId: null,
    step: "setup",
    view: "2d",
    tool: "select",
    pendingFootprint: { w: 1, d: 1 },
    zoom: 1,
    past: [],
    future: [],

    setGrid: (g) => set({ grid: g }),
    setStep: (step) => set({ step }),
    setView: (view) => set({ view }),
    setTool: (tool) => set({ tool }),
    setPendingFootprint: (w, d) => set({ pendingFootprint: { w, d }, tool: "add" }),
    setZoom: (zoom) => set({ zoom: Math.max(0.4, Math.min(2.5, zoom)) }),
    select: (selectedId) => set({ selectedId }),

    addBin: (x, y, w, d) => {
      const { grid, bins } = get();
      if (!canPlace(grid, bins, x, y, w, d)) return;
      snapshot();
      const b = makeBin(x, y, w, d);
      set((s) => ({ bins: [...s.bins, b], selectedId: b.id }));
    },

    addModel: (x, y, w, d, model, heightU) => {
      const { grid, bins } = get();
      if (!canPlace(grid, bins, x, y, w, d)) return;
      snapshot();
      const b: Bin = { ...makeBin(x, y, w, d), kind: "model", model, heightU };
      set((s) => ({ bins: [...s.bins, b], selectedId: b.id }));
    },

    updateBin: (id, patch) => {
      snapshot();
      set((s) => ({ bins: s.bins.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
    },

    moveBin: (id, x, y) => {
      const { grid, bins } = get();
      const b = bins.find((b) => b.id === id);
      if (!b || !canPlace(grid, bins, x, y, b.w, b.d, id)) return;
      snapshot();
      set((s) => ({ bins: s.bins.map((bb) => (bb.id === id ? { ...bb, x, y } : bb)) }));
    },

    resizeBin: (id, w, d) => {
      const { grid, bins } = get();
      const b = bins.find((b) => b.id === id);
      if (!b || w < 1 || d < 1 || !canPlace(grid, bins, b.x, b.y, w, d, id)) return;
      snapshot();
      set((s) => ({ bins: s.bins.map((bb) => (bb.id === id ? { ...bb, w, d } : bb)) }));
    },

    deleteBin: (id) => {
      snapshot();
      set((s) => ({
        bins: s.bins.filter((b) => b.id !== id),
        selectedId: s.selectedId === id ? null : s.selectedId,
      }));
    },

    duplicateBin: (id) => {
      const { grid, bins } = get();
      const src = bins.find((b) => b.id === id);
      if (!src) return;
      // find the first free spot for a copy of the same footprint
      for (let y = 0; y <= grid.rows - src.d; y++) {
        for (let x = 0; x <= grid.cols - src.w; x++) {
          if (canPlace(grid, bins, x, y, src.w, src.d)) {
            snapshot();
            const copy = { ...src, id: newId(), x, y };
            set((s) => ({ bins: [...s.bins, copy], selectedId: copy.id }));
            return;
          }
        }
      }
    },

    // copy the selected bin's settings (not footprint/position) to all bins
    applyToAll: (id) => {
      const src = get().bins.find((b) => b.id === id);
      if (!src) return;
      snapshot();
      set((s) => ({
        bins: s.bins.map((b) => ({
          ...b,
          heightU: src.heightU,
          comp: { ...src.comp },
          label: src.label,
          scoop: src.scoop,
          magnetHoles: src.magnetHoles,
          screwHoles: src.screwHoles,
        })),
      }));
    },

    clear: () => {
      snapshot();
      set({ bins: [], selectedId: null });
    },

    undo: () =>
      set((s) => {
        if (!s.past.length) return s;
        const prev = s.past[s.past.length - 1];
        return {
          bins: prev,
          past: s.past.slice(0, -1),
          future: [s.bins, ...s.future],
          selectedId: null,
        };
      }),

    redo: () =>
      set((s) => {
        if (!s.future.length) return s;
        const next = s.future[0];
        return {
          bins: next,
          future: s.future.slice(1),
          past: [...s.past, s.bins],
          selectedId: null,
        };
      }),
  };
});
