import type { CreateFlashcardProposalResponseDto, CreateFlashcardCommand } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { OpenRouterService } from "./openrouter.service";
import type { OpenRouterConfig } from "./openrouter.types";
import { GenerationError, GenerationErrorCode } from "./generation.errors";

const openRouterConfig: OpenRouterConfig = {
  apiKey:
    import.meta.env.OPENROUTER_API_KEY ??
    (() => {
      throw new Error("OPENROUTER_API_KEY environment variable is not set");
    })(),
  model: "google/learnlm-1.5-pro-experimental:free",
  systemMessage: `You are an expert at creating flashcards from given text.
Your task is to analyze the input text and create meaningful flashcards that help in learning the material.
Each flashcard should have a front (question/concept) and back (answer/explanation).
Front should contain maximum 200 characters. Back should contain maximum 500 characters.
Return at most 3 flashcards.`, // todo: just 3 for now to support free models' token restrictions
  responseFormat: {
    type: "json_schema" as const,
    json_schema: {
      name: "flashcards_schema",
      strict: true,
      schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["flashcards"],
      },
    },
  },
};
const openRouterService = new OpenRouterService(openRouterConfig);

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
    // Generate flashcards using OpenRouter service
    const aiResponse = await openRouterService.sendChatRequest(inputText).catch((error) => {
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

    // Parse the AI response to get flashcards
    let parsedResponse = null;
    try {
      parsedResponse = JSON.parse(aiResponse.choices[0].message.content) as {
        flashcards: CreateFlashcardCommand[];
      };
    } catch (error) {
      console.error("Failed to parse response", aiResponse);
      throw new GenerationError(GenerationErrorCode.AI_SERVICE_ERROR, "Failed to parse response", error);
    }

    // Create generation record with actual duration
    const { data: generation, error: generationError } = await supabase
      .from("generations")
      .insert({
        input_text: inputText,
        user_id: userId,
        generation_duration_ms: generationDurationMs,
        model_used: openRouterConfig.model,
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
      proposed_flashcards: parsedResponse.flashcards,
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
