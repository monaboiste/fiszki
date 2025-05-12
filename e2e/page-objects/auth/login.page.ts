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
  }

  /**
   * Navigates to the login page
   */
  async goto() {
    await this.page.goto("/auth/login");
  }

  /**
   * Attempts to log in with the provided credentials
   */
  async login(email: string, password: string) {
    await this.emailInput.waitFor({ state: "visible" }).then(() => this.emailInput.fill(email));
    await this.passwordInput.waitFor({ state: "visible" }).then(() => this.passwordInput.fill(password));
    await this.submitButton.click();
  }

  /**
   * Gets the current URL of the page
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
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
   * Enters an invalid email and triggers validation
   */
  async enterInvalidEmail(invalidEmail: string) {
    await this.emailInput.fill(invalidEmail);
    await this.emailInput.blur();
  }

  /**
   * Gets the email format error message if visible
   */
  async getEmailFormatError(): Promise<string | null> {
    await expect(this.emailFormatError).toBeVisible();
    return await this.emailFormatError.textContent();
  }

  /**
   * Attempts to submit form with empty password
   */
  async submitWithEmptyPassword(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  /**
   * Gets the password required error message if visible
   */
  async getPasswordRequiredError(): Promise<string | null> {
    await expect(this.passwordRequiredError).toBeVisible();
    return await this.passwordRequiredError.textContent();
  }

  async waitForUrl(url: string) {
    await this.page.waitForURL(`**${url}`, { waitUntil: "domcontentloaded" });
  }

  async saveState() {
    await this.page.context().storageState({ path: AUTH_FILE });
  }
}
