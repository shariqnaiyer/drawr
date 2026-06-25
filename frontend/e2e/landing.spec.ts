import { test, expect } from "@playwright/test";

test.describe("Landing", () => {
  test("renders hero and navigates to the editor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Design .*Gridfinity.* storage/i })).toBeVisible();
    await expect(page.getByText(/export watertight/i)).toBeVisible();

    await page.getByTestId("hero-open-editor").click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByText(/Set up your grid/i)).toBeVisible();
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/does-not-exist");
    await expect(page.getByText(/This grid cell is empty/i)).toBeVisible();
  });
});
