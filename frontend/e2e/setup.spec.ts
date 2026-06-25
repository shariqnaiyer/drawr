import { test, expect } from "@playwright/test";
import { stubBackend } from "./helpers";

test.describe("Setup", () => {
  test.beforeEach(async ({ page }) => {
    await stubBackend(page);
    await page.goto("/app");
  });

  test("computes a grid from the default drawer dimensions", async ({ page }) => {
    await expect(page.getByText(/Set up your grid/i)).toBeVisible();
    // default 300 x 220 mm -> 7 x 5 units
    await expect(page.getByText("7 × 5")).toBeVisible();
    await expect(page.getByText(/294 × 210 mm baseplate/i)).toBeVisible();
  });

  test("switching to unit-count mode keeps the result in sync", async ({ page }) => {
    await page.getByTestId("mode-units").click();
    await expect(page.getByText("7 × 5")).toBeVisible();
  });

  test("Generate grid enters the editor", async ({ page }) => {
    await page.getByTestId("generate-grid").click();
    await expect(page.getByTestId("canvas-stage")).toBeVisible();
    await expect(page.getByTestId("status-bar")).toContainText("7 × 5");
  });
});
