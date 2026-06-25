import { describe, expect, it } from "vitest";
import { MODELS, searchCatalog, licenseInfo } from "../catalog";

describe("catalog data", () => {
  it("ships a non-empty, well-formed dataset", () => {
    expect(MODELS.length).toBeGreaterThan(10);
    for (const m of MODELS) {
      expect(m.id).toMatch(/^[a-z0-9-]+$/);
      expect(m.sourceUrl).toMatch(/^https?:\/\//);
      // redistributable must be consistent with the license
      const permissive = ["CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0", "MIT", "GPL-3.0", "BSD-3-Clause", "CERN-OHL-S-2.0"];
      expect(m.redistributable).toBe(permissive.includes(m.license));
      // only permissive generators are marked generatable
      if (m.generator) expect(m.redistributable).toBe(true);
    }
  });

  it("tags some permissive generators as generatable bins", () => {
    const gen = MODELS.filter((m) => m.generator === "bin");
    expect(gen.length).toBeGreaterThanOrEqual(5);
    expect(gen.every((m) => m.redistributable)).toBe(true);
  });
});

describe("licenseInfo", () => {
  it("flags non-commercial licenses", () => {
    expect(licenseInfo("CC-BY-NC-SA-4.0").nonCommercial).toBe(true);
    expect(licenseInfo("CC-BY-4.0").nonCommercial).toBe(false);
  });
  it("treats CC0 as no-attribution / ok", () => {
    const l = licenseInfo("CC0-1.0");
    expect(l.tone).toBe("ok");
  });
  it("marks Unknown/Proprietary as restricted", () => {
    expect(licenseInfo("Unknown").tone).toBe("restricted");
    expect(licenseInfo("Proprietary").tone).toBe("restricted");
  });
});

describe("searchCatalog", () => {
  it("matches title/tags case-insensitively", () => {
    const r = searchCatalog("screwdriver");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((m) => (m.title + m.tags.join()).toLowerCase().includes("screwdriver"))).toBe(true);
  });
  it("filters by category", () => {
    const r = searchCatalog("", { category: "generators" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((m) => m.category === "generators")).toBe(true);
  });
  it("returns everything for an empty query + all category", () => {
    expect(searchCatalog("", { category: "all" }).length).toBe(MODELS.length);
  });
});
