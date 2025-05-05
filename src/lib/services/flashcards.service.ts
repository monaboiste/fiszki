import type { SupabaseClient } from "@supabase/supabase-js";
import type { BulkCreateFlashcardsResponseDto, FlashcardDto, FlashcardsListResponseDto } from "../../types";

interface GetFlashcardsParams {
  user_id: string;
  page: number;
  limit: number;
  sort: "created_at" | "updated_at";
  sort_direction: "asc" | "desc";
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
   * @param params - Parameters for fetching flashcards
   * @param params.user_id - ID of the user whose flashcards to fetch
   * @param params.page - Page number (1-based)
   * @param params.limit - Number of items per page
   * @param params.sort - Field to sort by (created_at or updated_at)
   * @param params.sort_direction - Sort direction (asc or desc)
   * @param params.filter - Optional array of filter criteria
   * @returns Promise with paginated flashcards and metadata
   */
  async getFlashcards({
    user_id,
    page,
    limit,
    sort,
    sort_direction,
    filter,
  }: GetFlashcardsParams): Promise<FlashcardsListResponseDto> {
    // First, get total count to handle pagination properly
    const countQuery = this.supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id);

    // Apply filters to count query if provided
    if (filter?.length) {
      for (const criterion of filter) {
        const [field, value] = criterion.split(":");
        if (field === "type") {
          countQuery.eq(field, value);
        }
      }
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to fetch flashcards count: ${countError.message}`);
    }

    const total = count ?? 0;

    // If there are no records or requested page is beyond available records, return empty result
    const lastPage = Math.ceil(total / limit);
    if (total === 0 || page > lastPage) {
      return {
        flashcards: [],
        page,
        limit,
        total,
      };
    }

    // Calculate range for the requested page
    const from = (page - 1) * limit;
    const to = Math.min(page * limit - 1, total - 1);

    // Fetch records
    let query = this.supabase.from("flashcards").select("*").eq("user_id", user_id);

    // Apply filters if provided
    if (filter?.length) {
      for (const criterion of filter) {
        const [field, value] = criterion.split(":");
        if (field === "type") {
          query = query.eq(field, value);
        }
      }
    }

    // Apply sorting and pagination
    query = query.order(sort, { ascending: sort_direction === "asc" }).range(from, to);

    const { data: flashcards, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return {
      flashcards: flashcards as FlashcardDto[],
      page,
      limit,
      total,
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
