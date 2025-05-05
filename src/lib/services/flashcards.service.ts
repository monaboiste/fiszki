import type { SupabaseClient } from "@supabase/supabase-js";
import type { BulkCreateFlashcardsResponseDto, FlashcardDto, FlashcardsListResponseDto } from "../../types";

interface GetFlashcardsParams {
  user_id: string;
  page: number;
  limit: number;
  sort: "created_at" | "updated_at";
  filter?: string[];
}

interface FlashcardWithUser {
  front: string;
  back: string;
  type: "manual" | "ai_generated" | "ai_generated_modified";
  user_id: string;
  generation_id: number | null;
}

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Retrieves a paginated list of flashcards for a given user with sorting and filtering options.
   */
  async getFlashcards({ user_id, page, limit, sort, filter }: GetFlashcardsParams): Promise<FlashcardsListResponseDto> {
    let query = this.supabase.from("flashcards").select("*", { count: "exact" }).eq("user_id", user_id);

    // Apply filters if provided
    if (filter?.length) {
      for (const criterion of filter) {
        const [field, value] = criterion.split(":");
        if (field === "type") {
          query = query.eq(field, value);
        }
      }
    }

    // Apply sorting
    query = query.order(sort, { ascending: false });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);

    const { data: flashcards, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return {
      flashcards: flashcards as FlashcardDto[],
      page,
      limit,
      total: count ?? 0,
    };
  }

  /**
   * Inserts flashcards in a batch and returns the inserted records.
   * @param flashcards - An array of flashcards with attached user_id.
   * @returns The response data containing inserted flashcards.
   * @throws Error if insertion fails.
   */
  async createFlashcards(flashcards: FlashcardWithUser[]): Promise<BulkCreateFlashcardsResponseDto> {
    console.log("Inserting flashcards:", flashcards);
    const { data, error } = await this.supabase.from("flashcards").insert(flashcards).select();
    if (error) {
      console.error("Error inserting flashcards in service:", error);
      throw new Error("Failed to insert flashcards");
    }
    return { flashcards: data };
  }
}
