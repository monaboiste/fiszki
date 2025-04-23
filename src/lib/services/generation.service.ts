import type { CreateFlashcardProposalResponseDto } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import type { AIService } from "./ai/types";
import { MockAIService } from "./ai/mock.service";
import { GenerationError, GenerationErrorCode } from "./errors/generation.errors";

const MOCK_MODEL = "gpt-4-turbo-preview";

// For now, we use the mock service
const aiService: AIService = new MockAIService();

async function logGenerationError(supabase: SupabaseClient, error: GenerationError, generationId?: number) {
  try {
    await supabase.from("ai_generation_logs").insert({
      generation_id: generationId,
      error_code: error.code,
      error_description: error.toErrorDescription(),
    });
  } catch (logError) {
    console.error("Failed to log generation error:", logError);
  }
}

export async function generateFlashcards(
  inputText: string,
  userId: string,
  supabase: SupabaseClient
): Promise<CreateFlashcardProposalResponseDto> {
  let generationId: number | undefined;
  const startTime = performance.now();

  try {
    // Generate flashcards using AI service
    const aiResponse = await aiService.generateFlashcards({ prompt: inputText }).catch((error) => {
      const generationError = new GenerationError(
        GenerationErrorCode.AI_SERVICE_ERROR,
        "Failed to generate flashcards using AI service",
        error
      );
      // Log error immediately since we don't have a generation record yet
      logGenerationError(supabase, generationError);
      throw generationError;
    });

    const generationDurationMs = Math.round(performance.now() - startTime);

    // Create generation record with actual duration
    const { data: generation, error: generationError } = await supabase
      .from("generations")
      .insert({
        input_text: inputText,
        user_id: userId,
        generation_duration_ms: generationDurationMs,
        model_used: MOCK_MODEL,
      })
      .select()
      .single();

    if (generationError) {
      const error = new GenerationError(
        GenerationErrorCode.DATABASE_ERROR,
        "Failed to create generation record",
        generationError
      );
      // Log database error
      await logGenerationError(supabase, error);
      throw error;
    }

    generationId = generation.generation_id;

    return {
      generation_id: generation.generation_id,
      proposed_flashcards: aiResponse.flashcards,
    };
  } catch (error) {
    const generationError =
      error instanceof GenerationError
        ? error
        : new GenerationError(GenerationErrorCode.UNKNOWN, "Unexpected error during flashcard generation", error);

    console.error(generationError);
    await logGenerationError(supabase, generationError, generationId);
    throw generationError;
  }
}
