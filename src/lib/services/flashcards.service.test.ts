import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardsService, FlashcardNotFoundError } from "./flashcards.service";
import type { SupabaseClient } from "../../db/supabase.client";

describe("flashcards.service", () => {
  describe("createFlashcards", () => {
    let mockSupabase: Partial<SupabaseClient>;
    let mockInsert: ReturnType<typeof vi.fn>;
    let mockSelect: ReturnType<typeof vi.fn>;
    let service: FlashcardsService;

    beforeEach(() => {
      mockSelect = vi.fn();
      mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      } as unknown as SupabaseClient;
      service = new FlashcardsService(mockSupabase as SupabaseClient);
    });

    it("should call Supabase insert and return result", async () => {
      const flashcards = [
        {
          front: "Question 1",
          back: "Answer 1",
          type: "manual" as const,
          user_id: "user123",
          generation_id: null,
        },
      ];

      const mockData = [{ id: 1, ...flashcards[0] }];

      mockSelect.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await service.createFlashcards(flashcards);

      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockInsert).toHaveBeenCalledWith(flashcards);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual({ flashcards: mockData });
    });

    it("should handle and throw on Supabase errors", async () => {
      const flashcards = [
        {
          front: "Question 1",
          back: "Answer 1",
          type: "manual" as const,
          user_id: "user123",
          generation_id: null,
        },
      ];

      const mockError = new Error("Database error");

      mockSelect.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(service.createFlashcards(flashcards)).rejects.toThrow("Failed to insert flashcards");
    });
  });

  describe("deleteFlashcardById", () => {
    let mockSupabase: Partial<SupabaseClient>;
    let mockDelete: ReturnType<typeof vi.fn>;
    let mockEq: ReturnType<typeof vi.fn>;
    let mockSelect: ReturnType<typeof vi.fn>;
    let service: FlashcardsService;
    const user_id = "user-1";
    const flashcard_id = 123;

    beforeEach(() => {
      mockSelect = vi.fn();
      mockEq = vi.fn().mockReturnThis();
      mockDelete = vi.fn().mockReturnValue({ eq: mockEq, select: mockSelect });
      mockSupabase = {
        from: vi.fn().mockReturnValue({ delete: mockDelete }),
      } as unknown as SupabaseClient;

      service = new FlashcardsService(mockSupabase as SupabaseClient);
    });

    it("should resolve when a flashcard is deleted", async () => {
      mockSelect.mockResolvedValue({ data: [{ flashcard_id, user_id }], error: null });

      await expect(service.deleteFlashcardById({ user_id, flashcard_id })).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("flashcard_id", flashcard_id);
      expect(mockEq).toHaveBeenCalledWith("user_id", user_id);
      expect(mockSelect).toHaveBeenCalled();
    });

    it("should throw generic Error on Supabase error", async () => {
      // Arrange: supabase returns an Error instance
      const supError = new Error("DB down");
      mockSelect.mockResolvedValue({ data: null, error: supError });

      await expect(service.deleteFlashcardById({ user_id, flashcard_id })).rejects.toThrow(
        `Failed to delete flashcard[${flashcard_id}]`
      );
    });

    it("should throw FlashcardNotFoundError when no rows deleted", async () => {
      mockSelect.mockResolvedValue({ data: [], error: null });

      await expect(service.deleteFlashcardById({ user_id, flashcard_id })).rejects.toBeInstanceOf(
        FlashcardNotFoundError
      );
    });
  });
});
