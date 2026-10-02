import { beforeEach, describe, expect, it, vi } from "vitest";
import raw from "../drawers/drawers.json";
import { DRAWERS, searchDrawers, validateDrawer, drawerById, type DrawerPreset } from "../drawers";
import { parseLength, formatLength } from "../lib/units";
import { maxBinU, stackHeightMm } from "../lib/fit";
import { loadRecent, rememberSize } from "../lib/recent";
import { useStore } from "../store";

describe("drawer dataset", () => {
  it("every shipped entry is valid (no rows silently dropped)", () => {
    const rows = raw as unknown[];
    const problems = rows
      .map((r) => ({ id: (r as DrawerPreset).id, errs: validateDrawer(r) }))
      .filter((p) => p.errs.length);
    expect(problems).toEqual([]);
    expect(DRAWERS.length).toBe(rows.length);
  });

  it("ids are unique", () => {
    const ids = (raw as DrawerPreset[]).map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry cites an https source", () => {
    for (const d of DRAWERS) expect(d.source_url).toMatch(/^https:\/\//);
  });

  it("covers furniture, tool chests and cases", () => {
    const cats = new Set(DRAWERS.map((d) => d.category));
    for (const c of ["furniture", "tool-chest", "case"]) expect(cats.has(c as DrawerPreset["category"])).toBe(true);
  });
});

describe("validateDrawer", () => {
  const good: DrawerPreset = {
    id: "acme-box", brand: "Acme", model: "Box", variant: "", category: "case", regions: ["global"],
    inner: { width_mm: 300, depth_mm: 200, height_mm: 80 },
    source_url: "https://example.com", source_kind: "manufacturer", confidence: "high", notes: "",
  };
  it("accepts a well-formed entry", () => expect(validateDrawer(good)).toEqual([]));
  it("rejects inches left unconverted and outer-size typos", () => {
    expect(validateDrawer({ ...good, inner: { ...good.inner, width_mm: 22 } }).length).toBeGreaterThan(0);
    expect(validateDrawer({ ...good, inner: { ...good.inner, depth_mm: 9000 } }).length).toBeGreaterThan(0);
  });
  it("rejects bad ids, categories and sources", () => {
    expect(validateDrawer({ ...good, id: "Bad Id" })).toContain("id must be kebab-case");
    expect(validateDrawer({ ...good, category: "garage" as never }).length).toBe(1);
    expect(validateDrawer({ ...good, source_url: "http://x" })).toContain("source_url must be https");
  });
  it("allows an unknown height", () => {
    expect(validateDrawer({ ...good, inner: { ...good.inner, height_mm: null } })).toEqual([]);
  });
});

describe("searchDrawers", () => {
  const list: DrawerPreset[] = [
    { id: "ikea-alex-5", brand: "IKEA", model: "ALEX", variant: "5-drawer", category: "furniture", regions: ["global"],
      inner: { width_mm: 294, depth_mm: 520, height_mm: null }, source_url: "https://a", source_kind: "community-measured", confidence: "medium", notes: "" },
    { id: "husky-52", brand: "Husky", model: "52 in. 18-Drawer", variant: "3 in. drawer", category: "tool-chest", regions: ["US"],
      inner: { width_mm: 600, depth_mm: 400, height_mm: 70 }, source_url: "https://b", source_kind: "retailer", confidence: "high", notes: "" },
  ];
  it("matches brand, model and variant tokens", () => {
    expect(searchDrawers("alex", { list }).map((d) => d.id)).toEqual(["ikea-alex-5"]);
    expect(searchDrawers("husky 3 in", { list }).map((d) => d.id)).toEqual(["husky-52"]);
  });
  it("tolerates a dropped letter", () => {
    expect(searchDrawers("alx", { list }).map((d) => d.id)).toEqual(["ikea-alex-5"]);
  });
  it("filters by category and returns everything for an empty query", () => {
    expect(searchDrawers("", { list, category: "tool-chest" }).map((d) => d.id)).toEqual(["husky-52"]);
    expect(searchDrawers("  ", { list })).toHaveLength(2);
  });
  it("returns nothing when a token matches nowhere", () => {
    expect(searchDrawers("alex zebra", { list })).toEqual([]);
  });
  it("drawerById handles unknown ids", () => {
    expect(drawerById("nope")).toBeNull();
    expect(drawerById(null)).toBeNull();
  });
});

describe("parseLength", () => {
  it("parses millimetres", () => {
    expect(parseLength("300", "mm")).toBe(300);
    expect(parseLength("300,5", "mm")).toBe(300.5);
    expect(parseLength("300 mm", "mm")).toBe(300);
  });
  it("parses inches, including fractions", () => {
    expect(parseLength("11.75", "in")).toBeCloseTo(298.45);
    expect(parseLength("11 3/4", "in")).toBeCloseTo(298.45);
    expect(parseLength("11-3/4\"", "in")).toBeCloseTo(298.45);
    expect(parseLength("3/4", "in")).toBeCloseTo(19.05);
  });
  it("rejects junk, zero and negatives", () => {
    for (const s of ["", "abc", "0", "-5", "1/0", "12 x"]) expect(parseLength(s, "mm")).toBeNull();
  });
  it("round-trips through formatLength", () => {
    expect(formatLength(298.45, "in")).toBe("11.75");
    expect(formatLength(300, "mm")).toBe("300");
  });
});

describe("height fit", () => {
  it("stack height is baseplate floor + 7 mm per U", () => {
    expect(stackHeightMm(6)).toBeCloseTo(43.2);
  });
  it("maxBinU leaves clearance under the drawer above", () => {
    expect(maxBinU(null)).toBeNull();
    expect(maxBinU(44.2)).toBe(6); // 1.2 + 42 + 1.0 exactly fits
    expect(maxBinU(44.1)).toBe(5);
    expect(maxBinU(10)).toBe(1); // too shallow for the 2 U minimum
    expect(maxBinU(1000)).toBe(20); // capped at the slider max
  });
  it("new bins default to a height that fits the drawer", () => {
    useStore.setState({ grid: { cols: 4, rows: 4 }, bins: [], past: [], future: [],
      drawer: { widthMm: 170, depthMm: 170, heightMm: 30, presetId: null, label: null } });
    useStore.getState().addBin(0, 0, 1, 1);
    expect(useStore.getState().bins[0].heightU).toBe(3);
    useStore.setState({ bins: [], drawer: null });
    useStore.getState().addBin(0, 0, 1, 1);
    expect(useStore.getState().bins[0].heightU).toBe(6);
  });
});

describe("recent sizes", () => {
  // an in-memory Storage, so the test doesn't depend on the DOM env providing one
  beforeEach(() => {
    const m = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, String(v)),
      removeItem: (k: string) => void m.delete(k),
      clear: () => m.clear(),
    });
  });
  it("remembers up to five sizes, newest first, without duplicates", () => {
    for (let i = 0; i < 7; i++) rememberSize({ widthMm: 100 + i, depthMm: 200, heightMm: null, presetId: null, label: null });
    rememberSize({ widthMm: 105, depthMm: 200, heightMm: null, presetId: null, label: null });
    const r = loadRecent();
    expect(r).toHaveLength(5);
    expect(r[0].widthMm).toBe(105);
    expect(r.filter((x) => x.widthMm === 105)).toHaveLength(1);
  });
  it("ignores corrupt storage", () => {
    localStorage.setItem("drawr:recent-sizes", "{not json");
    expect(loadRecent()).toEqual([]);
    localStorage.setItem("drawr:recent-sizes", JSON.stringify([{ widthMm: "x" }, { widthMm: 10, depthMm: 20 }]));
    expect(loadRecent()).toHaveLength(1);
  });
  it("degrades to no recents when storage throws", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
    expect(loadRecent()).toEqual([]);
    expect(() => rememberSize({ widthMm: 1, depthMm: 1, heightMm: null, presetId: null, label: null })).not.toThrow();
  });
});
