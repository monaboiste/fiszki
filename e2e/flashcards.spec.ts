import { test, expect } from "@playwright/test";
import { FlashcardsPage } from "./page-objects/flashcards/flashcards.page";

test.describe("Flashcards Page", () => {
  let flashcardsPage: FlashcardsPage;

  test.beforeEach(async ({ page }) => {
    flashcardsPage = new FlashcardsPage(page);
    await flashcardsPage.goto();
  });

  test("should find a flashcard by searching for its front content", async () => {
    const searchTerm = "hateoas";
    const expectedFlashcardTitle = "(E2E) What is HATEOAS in REST APIs?";

    await flashcardsPage.searchFor(searchTerm);

    const flashcard = await flashcardsPage.getFlashcardByFrontText(expectedFlashcardTitle);
    await expect(flashcard).toBeVisible();
  });
});
