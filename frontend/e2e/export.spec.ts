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

  test("the Export step in the top bar opens the export modal", async ({ page }) => {
    await stubBackend(page);
    await generateGrid(page);

    await page.getByTestId("step-export").click();
    await expect(page.getByText("Export STL files")).toBeVisible();

    // closing the modal returns to the Design step
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Export STL files")).toBeHidden();
    await expect(page.getByTestId("canvas-stage")).toBeVisible();
  });
});
