import { test, expect } from "@playwright/test";
import { stubBackend } from "./helpers";

// bosch-l-boxx-102: 378 × 313 × 63.5 mm inside → 9 × 7 units, tallest bin 8 U
test.describe("Common drawer presets", () => {
  test.beforeEach(async ({ page }) => {
    await stubBackend(page);
    await page.goto("/app");
  });

  test("search, pick with the keyboard, and fill the size", async ({ page }) => {
    await page.getByTestId("drawer-picker").click();
    await page.getByTestId("drawer-search").fill("l-boxx 102");
    await page.getByTestId("drawer-search").press("Enter");

    await expect(page.getByTestId("drawer-picker")).toContainText("L-BOXX 102");
    await expect(page.getByLabel("Width")).toHaveValue("378");
    await expect(page.getByLabel("Depth")).toHaveValue("313");
    await expect(page.getByLabel("Inside height (optional)")).toHaveValue("63.5");
    await expect(page.getByTestId("drawer-source")).toContainText("Source");
    await expect(page.getByText("9 × 7")).toBeVisible();
    await expect(page.getByTestId("setup-max-height")).toContainText("8 U");
  });

  test("editing a field detaches the preset", async ({ page }) => {
    await page.getByTestId("drawer-picker").click();
    await page.getByTestId("drawer-bosch-l-boxx-102").click();
    await expect(page.getByTestId("drawer-source")).toBeVisible();
    await page.getByLabel("Width").fill("400");
    await expect(page.getByTestId("drawer-source")).toBeHidden();
    await expect(page.getByTestId("drawer-picker")).toContainText("Choose a common drawer");
  });

  test("inches convert both ways and accept fractions", async ({ page }) => {
    await page.getByTestId("unit-in").click();
    await expect(page.getByLabel("Width")).toHaveValue("11.81"); // 300 mm
    await page.getByLabel("Width").fill("11 3/4");
    await page.getByLabel("Depth").fill("8 3/4");
    await expect(page.getByText("7 × 5")).toBeVisible(); // 298.45 × 222.25 mm
    await page.getByTestId("unit-mm").click();
    await expect(page.getByLabel("Width")).toHaveValue("298.5");
  });

  test("a drawer's height limits bins in the editor", async ({ page }) => {
    await page.getByTestId("drawer-picker").click();
    await page.getByTestId("drawer-bosch-l-boxx-102").click();
    await page.getByTestId("generate-grid").click();

    const stage = page.getByTestId("canvas-stage");
    const box = (await stage.boundingBox())!;
    await page.getByTestId("fp-1x1").click();
    await page.mouse.click(box.x + box.width / 18, box.y + box.height / 14);
    await expect(page.getByTestId("bin-count")).toHaveText("1");

    await page.getByTestId("height-slider").fill("12");
    await expect(page.getByTestId("height-too-tall")).toContainText("8 U");
    await expect(page.getByTestId("status-state")).toContainText("too tall");

    await page.getByTestId("height-too-tall").getByRole("button", { name: "Set to 8 U" }).click();
    await expect(page.getByTestId("height-too-tall")).toBeHidden();
    await expect(page.getByTestId("status-state")).toContainText("Ready to export");
  });

  test("returning to Setup keeps the chosen drawer", async ({ page }) => {
    await page.getByTestId("drawer-picker").click();
    await page.getByTestId("drawer-bosch-l-boxx-102").click();
    await page.getByTestId("generate-grid").click();
    await page.getByTestId("step-setup").click();
    await expect(page.getByTestId("drawer-picker")).toContainText("L-BOXX 102");
    await expect(page.getByLabel("Width")).toHaveValue("378");
  });
});
