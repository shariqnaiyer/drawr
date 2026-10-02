import { test, expect } from "@playwright/test";

test.describe("Landing", () => {
  test("renders hero and navigates to the editor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Every drawer, perfectly organized/i })).toBeVisible();
    await expect(page.getByText(/download watertight STLs/i)).toBeVisible();

    await page.getByTestId("hero-open-editor").click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByText(/What size is your drawer\?/i)).toBeVisible();
  });

  test("nav button opens the editor", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-open-editor").click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/does-not-exist");
    await expect(page.getByRole("heading", { name: /This cell is empty/i })).toBeVisible();
    await page.getByRole("link", { name: /Back to drawr/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
