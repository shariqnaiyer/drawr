import { test, expect } from "@playwright/test";
import { stubBackend, generateGrid, stageGeometry } from "./helpers";

test.describe("Export", () => {
  test("lists parts and downloads a ZIP", async ({ page }) => {
    await stubBackend(page);
    await generateGrid(page);

    const { box, cw, ch } = await stageGeometry(page, 7, 5);
    await page.getByTestId("fp-2x1").click();
    await page.mouse.click(box.x + cw * 0.5, box.y + ch * 0.5);

    await page.getByTestId("export-stl-btn").click();
    await expect(page.getByText("Export STL files")).toBeVisible();
    await expect(page.getByText(/Baseplate 7×5/i)).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("export-download").click(),
    ]);
    expect(download.suggestedFilename()).toContain(".zip");
  });
});
