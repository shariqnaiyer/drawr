import { test, expect } from "@playwright/test";
import { stubBackend, generateGrid, stageGeometry } from "./helpers";

test.describe("Editor", () => {
  test.beforeEach(async ({ page }) => {
    await stubBackend(page);
    await generateGrid(page);
  });

  test("places a preset footprint by clicking the grid", async ({ page }) => {
    const { box, cw, ch } = await stageGeometry(page, 7, 5);
    await page.getByTestId("fp-2x1").click();
    await page.mouse.click(box.x + cw * 0.5, box.y + ch * 0.5);

    await expect(page.getByTestId("bin-count")).toHaveText("1");
    await expect(page.getByText("Bin · 2×1")).toBeVisible();
  });

  test("drag-to-draw creates a custom footprint", async ({ page }) => {
    const { box, cw, ch } = await stageGeometry(page, 7, 5);
    await page.getByTestId("fp-1x1").click();
    // sweep cells (3,0) -> (4,1) = a 2x2 bin
    await page.mouse.move(box.x + cw * 3.5, box.y + ch * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + cw * 4.2, box.y + ch * 1.0, { steps: 6 });
    await page.mouse.move(box.x + cw * 4.5, box.y + ch * 1.5, { steps: 6 });
    await page.mouse.up();

    await expect(page.getByTestId("bin-count")).toHaveText("1");
    await expect(page.getByText("Bin · 2×2")).toBeVisible();
  });

  test("rejects an overlapping placement", async ({ page }) => {
    const { box, cw, ch } = await stageGeometry(page, 7, 5);
    await page.getByTestId("fp-2x1").click();
    await page.mouse.click(box.x + cw * 0.5, box.y + ch * 0.5);
    await expect(page.getByTestId("bin-count")).toHaveText("1");

    // try to drop another bin on the same cell
    await page.getByTestId("fp-1x1").click();
    await page.mouse.click(box.x + cw * 0.5, box.y + ch * 0.5);
    await expect(page.getByTestId("bin-count")).toHaveText("1");
  });

  test("drag-moves a placed bin to a free cell", async ({ page }) => {
    const { box, cw, ch } = await stageGeometry(page, 7, 5);
    await page.getByTestId("fp-1x1").click();
    await page.mouse.click(box.x + cw * 0.5, box.y + ch * 0.5);
    const before = (await page.getByTestId("bin").boundingBox())!;

    // switch to select tool and drag the bin down 3 rows
    await page.getByTestId("tool-select").click();
    await page.mouse.move(box.x + cw * 0.5, box.y + ch * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + cw * 0.5, box.y + ch * 2.5, { steps: 10 });
    await page.mouse.move(box.x + cw * 0.5, box.y + ch * 3.5, { steps: 10 });
    await page.mouse.up();

    const after = (await page.getByTestId("bin").boundingBox())!;
    expect(after.y).toBeGreaterThan(before.y + ch); // moved down
    await expect(page.getByTestId("bin-count")).toHaveText("1");
  });

  test("inspector edits height and feature toggles", async ({ page }) => {
    const { box, cw, ch } = await stageGeometry(page, 7, 5);
    await page.getByTestId("fp-2x1").click();
    await page.mouse.click(box.x + cw * 0.5, box.y + ch * 0.5);

    await page.getByTestId("height-slider").fill("12");
    await expect(page.getByTestId("status-bar")).toBeVisible();
    await expect(page.getByText(/84 mm · 12 U/)).toBeVisible();

    const scoop = page.getByTestId("toggle-scoop");
    await expect(scoop).toHaveAttribute("aria-checked", "true");
    await scoop.click();
    await expect(scoop).toHaveAttribute("aria-checked", "false");
  });

  test("undo and redo restore the layout", async ({ page }) => {
    const { box, cw, ch } = await stageGeometry(page, 7, 5);
    await page.getByTestId("fp-1x1").click();
    await page.mouse.click(box.x + cw * 0.5, box.y + ch * 0.5);
    await page.mouse.click(box.x + cw * 2.5, box.y + ch * 0.5);
    await expect(page.getByTestId("bin-count")).toHaveText("2");

    await page.getByTestId("tool-undo").click();
    await expect(page.getByTestId("bin-count")).toHaveText("1");
    await page.getByTestId("tool-redo").click();
    await expect(page.getByTestId("bin-count")).toHaveText("2");
  });

  test("toggles between 2D and 3D views", async ({ page }) => {
    await page.getByTestId("view-3d").click();
    await expect(page.locator("canvas")).toBeVisible();
    await page.getByTestId("view-2d").click();
    await expect(page.getByTestId("canvas-stage")).toBeVisible();
  });
});
