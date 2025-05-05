import type { SupabaseClient } from "../../db/supabase.client";
import type {
  BulkCreateFlashcardsResponseDto,
  FlashcardDto,
  FlashcardEntity,
  FlashcardsListResponseDto,
} from "../../types";

interface GetFlashcardsParams {
  user_id: string;
  page: number;
  limit: number;
  sort: "created_at" | "updated_at";
  sort_direction: "asc" | "desc";
  filter?: string[];
}

interface GetFlashcardByIdParams {
  user_id: string;
  flashcard_id: number;
}

interface UpdateFlashcardByIdParams {
  user_id: string;
  flashcard_id: number;
  front: string;
  back: string;
}

type DeleteFlashcardByIdParams = GetFlashcardByIdParams;

interface FlashcardWithUser {
  front: string;
  back: string;
  type: "manual" | "ai_generated" | "ai_generated_modified";
  user_id: string;
  generation_id: number | null;
}

export class FlashcardNotFoundError extends Error {
  constructor(flashcardId: number) {
    super(`Flashcard with ID ${flashcardId} not found`);
    this.name = "FlashcardNotFoundError";
  }
}

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getFlashcardById({ user_id, flashcard_id }: GetFlashcardByIdParams): Promise<FlashcardDto> {
    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("flashcard_id", flashcard_id)
      .eq("user_id", user_id)
      .single();

    if (error && error.code === "PGRST116") {
      throw new FlashcardNotFoundError(flashcard_id);
    }

    if (error) {
      throw new Error(`Failed to fetch flashcard[${flashcard_id}]: ${error.message}`);
    }

    return flashcard;
  }

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

  async updateFlashcard({ user_id, flashcard_id, front, back }: UpdateFlashcardByIdParams): Promise<FlashcardDto> {
    const flashcardToUpdate: Partial<FlashcardEntity> = {
      flashcard_id,
      user_id,
      front,
      back,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedFlashcard, error } = await this.supabase
      .from("flashcards")
      .update(flashcardToUpdate)
      .eq("flashcard_id", flashcard_id)
      .eq("user_id", user_id)
      .select()
      .single();

    // Check if the update returned null, indicating no record was found or matched the conditions
    if (!updatedFlashcard) {
      // The update failed either because the flashcard doesn't exist
      // or because it doesn't belong to the user. In both cases, return 404.
      throw new FlashcardNotFoundError(flashcard_id);
    }

    // Handle potential errors from the update operation itself
    if (error) {
      console.error(`Failed to update flashcard[${flashcard_id}]:`, error);
      throw new Error(`Failed to update flashcard[${flashcard_id}]: ${error.message}`);
    }

    return updatedFlashcard;
  }

  // Deletes a flashcard by ID for a given user; throws if not found
  async deleteFlashcardById({ user_id, flashcard_id }: DeleteFlashcardByIdParams): Promise<void> {
    // Perform deletion query
    const response = await this.supabase
      .from("flashcards")
      .delete()
      .eq("flashcard_id", flashcard_id)
      .eq("user_id", user_id)
      .select();
    // Handle any errors from Supabase
    if (response.error) {
      console.error(`Failed to delete flashcard[${flashcard_id}]:`, response.error);
      throw new Error(`Failed to delete flashcard[${flashcard_id}]`);
    }
    // If no rows were deleted, the flashcard doesn't exist or doesn't belong to the user
    if (!response.data || response.data.length === 0) {
      throw new FlashcardNotFoundError(flashcard_id);
    }
  }
}
