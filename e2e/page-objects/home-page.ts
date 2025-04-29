import type { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
  }

  async navigate() {
    await this.page.goto("/");
  }

  async screenshot() {
    return this.page.screenshot();
  }
}
