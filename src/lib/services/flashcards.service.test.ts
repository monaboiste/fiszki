import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFlashcards } from "./flashcards.service";
import type { SupabaseClient } from "../../db/supabase.client";

describe("flashcards.service", () => {
  describe("createFlashcards", () => {
    let mockSupabase: Partial<SupabaseClient>;
    let mockInsert: ReturnType<typeof vi.fn>;
    let mockSelect: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockSelect = vi.fn();
      mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      } as unknown as SupabaseClient;

      // Spy on console.log and console.error
      vi.spyOn(console, "log").mockImplementation(() => undefined);
      vi.spyOn(console, "error").mockImplementation(() => undefined);
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

      const result = await createFlashcards(flashcards, mockSupabase as SupabaseClient);

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

      await expect(createFlashcards(flashcards, mockSupabase as SupabaseClient)).rejects.toThrow(
        "Failed to insert flashcards"
      );

      expect(console.error).toHaveBeenCalledWith("Error inserting flashcards in service:", mockError);
    });
  });
});
