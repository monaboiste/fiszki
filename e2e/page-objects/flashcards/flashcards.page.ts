import { type Locator, type Page } from "@playwright/test";

export class FlashcardsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly flashcardItems: Locator;
  readonly flashcardItemFront: (text: string) => Locator; // Function to find a specific flashcard front

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId("search-flashcards-input");
    this.flashcardItems = page.getByTestId("flashcard-item");

    // Locator for a specific flashcard front within a flashcard item
    this.flashcardItemFront = (text: string) =>
      page
        .getByTestId("flashcard-item")
        .filter({ has: page.getByTestId("flashcard-item-front").getByText(text) })
        .getByTestId("flashcard-item-front");
  }

  async goto() {
    await this.page.goto("/flashcards");
    // Wait for the main page container to be visible to ensure the page is loaded
    await this.page.getByTestId("flashcards-view-page").waitFor();
  }

  async searchFor(term: string) {
    await this.searchInput.fill(term);
  }

  async getFlashcardByFrontText(text: string): Promise<Locator> {
    return this.flashcardItemFront(text);
  }
}
