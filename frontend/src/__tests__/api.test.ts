import { afterEach, describe, expect, it, vi } from "vitest";
import { computeGrid, exportZip } from "../api";
import type { Bin } from "../types";

function bin(overrides: Partial<Bin> = {}): Bin {
  return {
    id: "b1", x: 0, y: 0, w: 3, d: 2, heightU: 6,
    comp: { cols: 3, rows: 1 },
    label: true, scoop: true, magnetHoles: true, screwHoles: false,
    ...overrides,
  };
}

afterEach(() => vi.restoreAllMocks());

describe("api client", () => {
  it("computeGrid posts the mode + args and returns parsed JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cols: 7, rows: 5, plate_width_mm: 294, plate_depth_mm: 210, margin_x_mm: 3, margin_y_mm: 5 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await computeGrid("dimensions", { width_mm: 300, depth_mm: 220 });
    expect(res.cols).toBe(7);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ mode: "dimensions", width_mm: 300, depth_mm: 220 });
  });

  it("exportZip maps the frontend Bin shape to the backend BinSpec snake_case", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["zip"]) });
    vi.stubGlobal("fetch", fetchMock);

    await exportZip("Drawer A", { cols: 7, rows: 5 }, [bin()], true);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(body.name).toBe("Drawer A");
    expect(body.baseplate).toEqual({ cols: 7, rows: 5 });
    expect(body.include_baseplate).toBe(true);
    expect(body.bins[0]).toEqual({
      id: "b1", x: 0, y: 0, w: 3, d: 2,
      height_u: 6,
      compartments: { cols: 3, rows: 1 },
      label: true, scoop: true,
      magnet_holes: true, screw_holes: false,
    });
  });

  it("throws a helpful error when export fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: async () => "boom" }));
    await expect(exportZip("x", { cols: 1, rows: 1 }, [], true)).rejects.toThrow(/boom/);
  });
});
