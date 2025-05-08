/**
 * Test credentials for authentication flows
 * @module TestData
 */
export class LoginCredentials {
  public email: string;
  public password: string;

  constructor() {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      throw new Error("Test credentials not found. Please set E2E_EMAIL and E2E_PASSWORD environment variables.");
    }

    this.email = email;
    this.password = password;
  }

  /**
   * Gets valid test credentials from environment variables
   * @throws {Error} When required environment variables are not set
   */
  public getValidCredentials(): { email: string; password: string } {
    return { email: this.email, password: this.password };
  }

  /**
   * Gets invalid test credentials for negative testing
   */
  public getInvalidCredentials(): { email: string; password: string } {
    return {
      email: "invalid@example.com",
      password: "wrongpassword",
    };
  }

  /**
   * Gets a valid email format for testing
   */
  public getValidEmailFormat(): string {
    return this.email;
  }

  /**
   * Gets an invalid email format for testing
   */
  public getInvalidEmailFormat(): string {
    return "invalid-email";
  }
}
