import { test, expect } from "@playwright/test";
import { stubBackend, generateGrid } from "./helpers";

const CC0_SCREWDRIVER = "printables-universal-screwdriver-holder-audacity";

test.describe("Community model library", () => {
  test.beforeEach(async ({ page }) => {
    await stubBackend(page);
    await generateGrid(page);
  });

  test("search, import to grid, and credit on export", async ({ page }) => {
    await page.getByTestId("open-library").click();
    await expect(page.getByTestId("library-modal")).toBeVisible();

    await page.getByTestId("library-search").fill("screwdriver");
    const importBtn = page.getByTestId(`import-${CC0_SCREWDRIVER}`);
    await expect(importBtn).toBeVisible();
    await importBtn.click();
    await expect(importBtn).toContainText("Added");

    // close the library; the model is now on the grid
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByTestId("bin-count")).toHaveText("1");
    await expect(page.getByTestId("bin")).toContainText("Universal Screwdriver");

    // selecting it shows the model inspector with a source link
    await page.getByTestId("bin").click();
    await expect(page.getByTestId("model-source")).toBeVisible();

    // export lists it under credits (not as an STL part)
    await page.getByTestId("step-export").click();
    const credits = page.getByTestId("export-credits");
    await expect(credits).toBeVisible();
    await expect(credits).toContainText("Universal Screwdriver");
    await expect(credits).toContainText("CC0-1.0");
  });

  test("generating a permissive generator yields a real, editable bin", async ({ page }) => {
    await page.getByTestId("open-library").click();
    await page.getByTestId("cat-generators").click();

    // the canonical OpenSCAD generator is permissive -> "Generate bin"
    const genBtn = page.getByTestId("generate-gridfinity-rebuilt-openscad");
    await expect(genBtn).toBeVisible();
    await genBtn.click();
    await expect(genBtn).toContainText("Added");
    await page.getByRole("button", { name: "Close" }).click();

    // it's a real editable bin (shows full bin inspector + a solid toggle + provenance)
    await expect(page.getByTestId("bin-count")).toHaveText("1");
    await page.getByTestId("bin").click();
    await expect(page.getByTestId("bin-source")).toBeVisible();
    await expect(page.getByTestId("toggle-solid")).toBeVisible();

    // toggling solid keeps it a real exportable part (no export-credits section)
    await page.getByTestId("toggle-solid").click();
    await page.getByTestId("step-export").click();
    await expect(page.getByText(/Lid 2×2/)).toBeVisible();
  });

  test("category filter narrows results", async ({ page }) => {
    await page.getByTestId("open-library").click();
    await page.getByTestId("cat-generators").click();
    // generators include the canonical OpenSCAD generator
    await expect(page.getByText("Gridfinity Rebuilt in OpenSCAD")).toBeVisible();
  });
});
