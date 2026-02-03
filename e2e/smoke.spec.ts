import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("User can visit homepage and see level selection", async ({ page }) => {
    await page.goto("/");

    // Expect title or key element
    // Assuming "Language Proficiency" is visible initially or "A1" level
    await expect(page.getByText("Language Proficiency", { exact: true })).toBeVisible();
    // Use first() to avoid strict mode violation (A1 appears in both span and option)
    await expect(page.getByText("A1").first()).toBeVisible();
  });

  test("User can navigate to a session (A1 Unit 1)", async ({ page }) => {
    await page.goto("/");

    // Click on A1 -> Unit 1
    // Note: Depends on actual text. Assuming "Unit 1" is visible or inside A1.
    // If specific click flow needed:
    await page.getByText("A1").first().click();
    await page.getByText("Unit 1").first().click();

    // Verify session loaded
    // Check for input area or "Check" button
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });

  test("App is responsive on mobile", async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify "Language Proficiency" or Hamburger menu if implemented
    // For now just check it loads without error
    await expect(page.getByText("Language Proficiency", { exact: true })).toBeVisible();
  });
});
