import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/auth/login.page";
import { LoginCredentials } from "./fixtures/auth/credentials";

test.describe("Login Flow", () => {
  let loginPage: LoginPage;
  let credentials: LoginCredentials;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    credentials = new LoginCredentials();
    await loginPage.goto();

    await expect(await loginPage.isPageVisible()).toBe(true);
  });

  test("successful login with valid credentials", async ({ page }) => {
    const successfullyLoggedInURL = "/generate";
    const { email, password } = credentials.getValidCredentials();

    await loginPage.login(email, password);

    await expect(page).toHaveURL(successfullyLoggedInURL, {
      timeout: 15_000,
    });

    await loginPage.saveState();
  });

  test("displays error with invalid credentials", async () => {
    const { email, password } = credentials.getInvalidCredentials();

    await loginPage.login(email, password);
    const errorMessage = await loginPage.getErrorMessage();

    await expect(errorMessage).toBe("Invalid email or password");
  });

  test("validates email format", async () => {
    await loginPage.fillEmail(credentials.getInvalidEmailFormat());
    await loginPage.clickSubmit();

    const errorMessage = await loginPage.getEmailFormatError();

    await expect(errorMessage).toBe("Please enter a valid email address");
  });

  test("requires email field", async () => {
    await loginPage.fillEmail("");
    await loginPage.clickSubmit();

    const errorMessage = await loginPage.getEmailRequiredError();

    await expect(errorMessage).toBe("Please enter a valid email address");
  });

  test("requires password field", async () => {
    await loginPage.fillPassword("");
    await loginPage.clickSubmit();

    const errorMessage = await loginPage.getPasswordRequiredError();

    await expect(errorMessage).toBe("Please enter your password");
  });
});
