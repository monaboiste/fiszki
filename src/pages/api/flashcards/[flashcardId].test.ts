/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "./[flashcardId]";
import * as serviceModule from "../../../lib/services/flashcards.service";

// Extract the real error class for comparison
const { FlashcardNotFoundError } = serviceModule;

// Mock the FlashcardsService to control deleteFlashcardById behavior
const mockDelete = vi.fn();
vi.mock("../../../lib/services/flashcards.service", async () => {
  const actual = await vi.importActual<typeof serviceModule>("../../../lib/services/flashcards.service");
  return {
    ...actual,
    FlashcardsService: vi.fn().mockImplementation(() => ({ deleteFlashcardById: mockDelete })),
  };
});

describe("DELETE /flashcards/:flashcardId handler", () => {
  const supabase = {} as any;
  const user = { id: "user-1", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 204 and calls service for a valid ID", async () => {
    // Arrange: service resolves successfully
    mockDelete.mockResolvedValueOnce(undefined);
    const context = { params: { flashcardId: "123" }, locals: { supabase, user } } as any;

    // Act
    const response = (await DELETE(context)) as Response;

    // Assert
    expect(response.status).toBe(204);
    const text = await response.text();
    expect(text).toBe("");
    expect(mockDelete).toHaveBeenCalledWith({ user_id: user.id, flashcard_id: 123 });
  });

  it("returns 400 when flashcardId is invalid", async () => {
    const context = { params: { flashcardId: "abc" }, locals: { supabase, user } } as any;
    const response = (await DELETE(context)) as Response;

    expect(response.status).toBe(400);
    const json = JSON.parse(await response.text());
    expect(json.error).toBe("Invalid parameters");
    expect(Array.isArray(json.details)).toBe(true);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 404 when flashcard not found", async () => {
    // Arrange: service throws FlashcardNotFoundError
    mockDelete.mockRejectedValueOnce(new FlashcardNotFoundError(123));
    const context = { params: { flashcardId: "123" }, locals: { supabase, user } } as any;

    const response = (await DELETE(context)) as Response;
    expect(response.status).toBe(404);
    const json = JSON.parse(await response.text());
    expect(json.error).toBe("Flashcard with ID 123 not found");
  });

  it("returns 500 on unexpected service error", async () => {
    // Arrange: service throws generic error
    mockDelete.mockRejectedValueOnce(new Error("DB down"));
    const context = { params: { flashcardId: "123" }, locals: { supabase, user } } as any;

    const response = (await DELETE(context)) as Response;
    expect(response.status).toBe(500);
    const json = JSON.parse(await response.text());
    expect(json.error).toBe("Internal server error");
  });
});
