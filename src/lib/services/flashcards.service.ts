import type { SupabaseClient } from "../../db/supabase.client";
import type { BulkCreateFlashcardsResponseDto } from "../../types";

interface FlashcardWithUser {
  front: string;
  back: string;
  type: "manual" | "ai_generated" | "ai_generated_modified";
  user_id: number;
}

/**
 * Inserts flashcards in a batch and returns the inserted records.
 * @param supabase - The Supabase client instance.
 * @param flashcards - An array of flashcards with attached user_id.
 * @returns The response data containing inserted flashcards.
 * @throws Error if insertion fails.
 */
export async function createFlashcards(
  flashcards: FlashcardWithUser[],
  supabase: SupabaseClient
): Promise<BulkCreateFlashcardsResponseDto> {
  console.log("Inserting flashcards:", flashcards);
  const { data, error } = await supabase.from("flashcards").insert(flashcards).select();
  if (error) {
    console.error("Error inserting flashcards in service:", error);
    throw new Error("Failed to insert flashcards");
  }
  return { flashcards: data };
}
