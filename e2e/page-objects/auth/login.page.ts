import { type Page, type Locator, expect } from "@playwright/test";
import { AUTH_FILE } from "playwright.config";

/**
 * Page Object Model for the login page.
 * Handles all interactions with the login form.
 *
 * @example
 * ```typescript
 * const loginPage = new LoginPage(page);
 * await loginPage.goto();
 * await loginPage.login('user@example.com', 'password');
 * ```
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly pageContainer: Locator;

  // Form validation messages
  private readonly emailFormatError: Locator;
  private readonly passwordRequiredError: Locator;
  private readonly emailRequiredError: Locator;

  constructor(page: Page) {
    this.page = page;
    // Main form elements
    this.emailInput = page.getByTestId("login-email");
    this.passwordInput = page.getByTestId("login-password");
    this.submitButton = page.getByTestId("login-submit");
    this.errorMessage = page.getByTestId("login-error");
    this.pageContainer = page.getByTestId("auth-page");

    // Validation messages
    this.emailFormatError = page.locator("text=Please enter a valid email address");
    this.passwordRequiredError = page.locator("text=Please enter your password");
    this.emailRequiredError = page.locator("text=Please enter a valid email address");
  }

  /**
   * Navigates to the login page
   */
  async goto() {
    await this.page.goto("/auth/login");
  }

  async fillEmail(email: string) {
    const emailInput = this.emailInput;
    await expect(emailInput).toBeVisible();
    await emailInput.fill(email);
  }

  async fillPassword(password: string) {
    const passwordInput = this.passwordInput;
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);
  }

  async clickSubmit() {
    const submitButton = this.submitButton;
    await expect(submitButton).toBeVisible();
    await submitButton.click();
  }

  /**
   * Attempts to log in with the provided credentials
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  /**
   * Gets the error message text if present
   */
  async getErrorMessage(): Promise<string | null> {
    await expect(this.errorMessage).toBeVisible();
    return await this.errorMessage.textContent();
  }

  /**
   * Checks if the page container is visible
   */
  async isPageVisible(options?: { timeout?: number }): Promise<boolean> {
    return this.pageContainer.isVisible({ timeout: options?.timeout });
  }

  /**
   * Gets the email format error message if visible
   */
  async getEmailFormatError(): Promise<string | null> {
    await expect(this.emailFormatError).toBeVisible();
    return await this.emailFormatError.textContent();
  }

  /**
   * Gets the password required error message if visible
   */
  async getEmailRequiredError(): Promise<string | null> {
    await expect(this.emailRequiredError).toBeVisible();
    return await this.emailRequiredError.textContent();
  }

  /**
   * Gets the password required error message if visible
   */
  async getPasswordRequiredError(): Promise<string | null> {
    await expect(this.passwordRequiredError).toBeVisible();
    return await this.passwordRequiredError.textContent();
  }

  async saveState() {
    await this.page.context().storageState({ path: AUTH_FILE });
  }
}
