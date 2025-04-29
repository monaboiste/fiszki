import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/home-page";

test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.navigate();

    // Assert
    await expect(page).toHaveTitle(/10xFiszki/);
  });
});
