import { beforeEach, describe, expect, it } from "vitest";
import { useStore, inBounds, overlaps, canPlace } from "../store";

// Reset the store to a known 7x5 grid with no bins before each test.
function reset() {
  useStore.setState({
    grid: { cols: 7, rows: 5 },
    bins: [],
    selectedId: null,
    past: [],
    future: [],
    tool: "select",
  });
}

const s = () => useStore.getState();

describe("placement geometry", () => {
  it("inBounds respects grid edges", () => {
    const g = { cols: 7, rows: 5 };
    expect(inBounds(g, 0, 0, 1, 1)).toBe(true);
    expect(inBounds(g, 6, 4, 1, 1)).toBe(true);
    expect(inBounds(g, 6, 4, 2, 1)).toBe(false); // off the right edge
    expect(inBounds(g, -1, 0, 1, 1)).toBe(false);
  });

  it("overlaps detects intersection and ignores a given id", () => {
    const bins = [{ id: "a", x: 1, y: 1, w: 2, d: 2 } as any];
    expect(overlaps(bins, 2, 2, 1, 1)).toBe(true);
    expect(overlaps(bins, 3, 1, 1, 1)).toBe(false); // adjacent, not overlapping
    expect(overlaps(bins, 1, 1, 1, 1, "a")).toBe(false); // ignoring self
  });

  it("canPlace combines bounds + overlap", () => {
    const g = { cols: 7, rows: 5 };
    const bins = [{ id: "a", x: 0, y: 0, w: 2, d: 2 } as any];
    expect(canPlace(g, bins, 2, 0, 1, 1)).toBe(true);
    expect(canPlace(g, bins, 1, 1, 1, 1)).toBe(false); // overlaps a
    expect(canPlace(g, bins, 7, 0, 1, 1)).toBe(false); // out of bounds
  });
});

describe("store mutations", () => {
  beforeEach(reset);

  it("addBin places a bin and selects it", () => {
    s().addBin(0, 0, 2, 1);
    expect(s().bins).toHaveLength(1);
    expect(s().bins[0]).toMatchObject({ x: 0, y: 0, w: 2, d: 1, heightU: 6 });
    expect(s().selectedId).toBe(s().bins[0].id);
  });

  it("addBin rejects out-of-bounds and overlapping placements", () => {
    s().addBin(0, 0, 2, 2);
    s().addBin(1, 1, 1, 1); // overlaps
    s().addBin(7, 0, 1, 1); // out of bounds
    expect(s().bins).toHaveLength(1);
  });

  it("moveBin only moves to a valid cell", () => {
    s().addBin(0, 0, 1, 1);
    const id = s().bins[0].id;
    s().addBin(2, 0, 1, 1);
    s().moveBin(id, 2, 0); // occupied -> rejected
    expect(s().bins.find((b) => b.id === id)!.x).toBe(0);
    s().moveBin(id, 4, 4); // free -> ok
    expect(s().bins.find((b) => b.id === id)!).toMatchObject({ x: 4, y: 4 });
  });

  it("resizeBin respects bounds/overlap", () => {
    s().addBin(0, 0, 1, 1);
    const id = s().bins[0].id;
    s().addBin(1, 0, 1, 1);
    s().resizeBin(id, 2, 1); // would overlap neighbour -> rejected
    expect(s().bins.find((b) => b.id === id)!.w).toBe(1);
    s().resizeBin(id, 1, 3); // grows down -> ok
    expect(s().bins.find((b) => b.id === id)!.d).toBe(3);
  });

  it("updateBin patches feature flags", () => {
    s().addBin(0, 0, 1, 1);
    const id = s().bins[0].id;
    s().updateBin(id, { heightU: 12, scoop: false });
    expect(s().bins[0]).toMatchObject({ heightU: 12, scoop: false });
  });

  it("duplicateBin clones into the next free slot", () => {
    s().addBin(0, 0, 2, 2);
    const id = s().bins[0].id;
    s().duplicateBin(id);
    expect(s().bins).toHaveLength(2);
    expect(s().bins[1].w).toBe(2);
    // the copy must not overlap the original
    expect(overlaps([s().bins[0]], s().bins[1].x, s().bins[1].y, s().bins[1].w, s().bins[1].d)).toBe(false);
  });

  it("deleteBin removes and clears selection", () => {
    s().addBin(0, 0, 1, 1);
    const id = s().bins[0].id;
    s().deleteBin(id);
    expect(s().bins).toHaveLength(0);
    expect(s().selectedId).toBeNull();
  });

  it("applyToAll copies settings but not footprint/position", () => {
    s().addBin(0, 0, 1, 1);
    s().addBin(2, 0, 3, 2);
    const first = s().bins[0].id;
    s().updateBin(first, { heightU: 12, magnetHoles: false, comp: { cols: 3, rows: 1 } });
    s().applyToAll(first);
    const other = s().bins[1];
    expect(other).toMatchObject({ heightU: 12, magnetHoles: false });
    expect(other.comp).toEqual({ cols: 3, rows: 1 });
    expect(other.w).toBe(3); // footprint untouched
  });

  it("addModel places a model-kind placement that reserves space", () => {
    const ref = {
      catalogId: "x", title: "Battery holder", author: "someone",
      source: "printables", sourceUrl: "https://example.com", license: "CC-BY-4.0", thumbnail: null,
    };
    s().addModel(0, 0, 2, 1, ref, 6);
    const m = s().bins[0];
    expect(m.kind).toBe("model");
    expect(m.model?.title).toBe("Battery holder");
    expect(m).toMatchObject({ w: 2, d: 1 });
    // it blocks overlapping bins like any placement
    s().addBin(0, 0, 1, 1);
    expect(s().bins).toHaveLength(1);
  });

  it("addGeneratedBin creates a real editable bin with provenance", () => {
    s().addGeneratedBin(0, 0, 2, 2, { title: "Gridfinity Rebuilt", url: "https://example.com", license: "MIT" });
    const b = s().bins[0];
    expect(b.kind ?? "bin").toBe("bin"); // a real bin, not a model placeholder
    expect(b.source?.title).toBe("Gridfinity Rebuilt");
    expect(b).toMatchObject({ w: 2, d: 2 });
    // it's a normal bin: editable
    s().updateBin(b.id, { solid: true, heightU: 3 });
    expect(s().bins[0]).toMatchObject({ solid: true, heightU: 3 });
  });

  it("undo/redo restore prior layouts", () => {
    s().addBin(0, 0, 1, 1);
    s().addBin(2, 0, 1, 1);
    expect(s().bins).toHaveLength(2);
    s().undo();
    expect(s().bins).toHaveLength(1);
    s().undo();
    expect(s().bins).toHaveLength(0);
    s().redo();
    expect(s().bins).toHaveLength(1);
  });
});
