import type { Page } from "@playwright/test";

/**
 * Stub the backend at the network layer. The 3D preview is client-side, so the
 * only endpoints the UI actually calls are /api/grid/compute and /api/export.
 * The grid stub mirrors the real backend's math so assertions stay meaningful.
 */
export async function stubBackend(page: Page) {
  await page.route("**/api/grid/compute", async (route) => {
    const body = route.request().postDataJSON() as {
      mode: string; width_mm?: number; depth_mm?: number; cols?: number; rows?: number;
    };
    let cols: number, rows: number;
    if (body.mode === "dimensions") {
      cols = Math.floor((body.width_mm ?? 0) / 42);
      rows = Math.floor((body.depth_mm ?? 0) / 42);
    } else {
      cols = body.cols ?? 1;
      rows = body.rows ?? 1;
    }
    const plateW = cols * 42;
    const plateD = rows * 42;
    await route.fulfill({
      json: {
        cols, rows,
        plate_width_mm: plateW, plate_depth_mm: plateD,
        margin_x_mm: Number((((body.width_mm ?? plateW) - plateW) / 2).toFixed(2)),
        margin_y_mm: Number((((body.depth_mm ?? plateD) - plateD) / 2).toFixed(2)),
      },
    });
  });

  // Export returns a tiny valid ZIP (PK header) so the download flow works.
  await page.route("**/api/export", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/zip",
      headers: { "Content-Disposition": 'attachment; filename="gridfinity-design.zip"' },
      body: Buffer.from([0x50, 0x4b, 0x05, 0x06, ...new Array(18).fill(0)]),
    });
  });
}

/** Get the canvas stage box and per-cell pixel size (cols x rows grid). */
export async function stageGeometry(page: Page, cols: number, rows: number) {
  const stage = page.getByTestId("canvas-stage");
  const box = (await stage.boundingBox())!;
  return { box, cw: box.width / cols, ch: box.height / rows };
}

/** Walk through the Setup screen with the default dimensions, landing in the editor. */
export async function generateGrid(page: Page) {
  await page.goto("/app");
  await page.getByTestId("generate-grid").click();
  await page.getByTestId("canvas-stage").waitFor();
}
