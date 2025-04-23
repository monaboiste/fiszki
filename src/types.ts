// ----------------------------------------
// DTO and Command Model definitions for the Fiszki API.
// These types extend or transform the base database entity types from the database models to conform with the API specification.
// ----------------------------------------

import type { Tables } from "./db/database.types";

// ----------------------------------------
// Aliases for database model definitions.
// ----------------------------------------
export type FlashcardEntity = Tables<"flashcards">;
export type AIGenerationLogEntity = Tables<"ai_generation_logs">;
export type GenerationEntity = Tables<"generations">;

/**
 * CreateFlashcardCommand represents the DTO for creating a new flashcard.
 * It requires the minimal fields from the FlashcardEntity needed for creation.
 */
export type CreateFlashcardCommand = Pick<FlashcardEntity, "front" | "back" | "type">;

/**
 * FlashcardDto represents the flashcard data returned by the API.
 * It is based on the FlashcardEntity model and includes the optional generation_id.
 */
export type FlashcardDto = FlashcardEntity;

/**
 * BulkCreateFlashcardsCommand represents the DTO for creating multiple flashcards in a single request.
 */
export interface BulkCreateFlashcardsCommand {
  flashcards: CreateFlashcardCommand[];
}

/**
 * BulkCreateFlashcardsResponseDto represents the response after a bulk flashcards creation operation.
 */
export interface BulkCreateFlashcardsResponseDto {
  flashcards: FlashcardDto[];
}

/**
 * UpdateFlashcardCommand represents the DTO for updating an existing flashcard.
 * Only the 'front' and 'back' fields are allowed to be updated.
 */
export type UpdateFlashcardCommand = Partial<Pick<FlashcardEntity, "front" | "back">>;

/**
 * UpdateFlashcardResponseDto represents the flashcard data returned after an update operation.
 */
export type UpdateFlashcardResponseDto = FlashcardDto;

/**
 * FlashcardsListResponseDto represents the paginated list response for flashcards.
 */
export interface FlashcardsListResponseDto {
  flashcards: FlashcardDto[];
  page: number;
  limit: number;
  total: number;
}

/**
 * RequestFlashcardGenerationCommand represents the DTO for initiating an AI flashcard generation request.
 */
export interface RequestFlashcardGenerationCommand {
  input_text: string;
}

/**
 * CreateFlashcardProposalResponseDto represents the response after initiating an AI flashcard generation request.
 * It includes the generation identifier and the proposed flashcards (using the same structure as creation command).
 */
export interface CreateFlashcardProposalResponseDto {
  proposed_flashcards: CreateFlashcardCommand[];
  generation_id: number;
}

/**
 * GenerationDto represents the details of an AI generation event, including metadata and the proposed flashcards.
 * Note: The database field 'model_used' is transformed to 'model' to align with the API specification.
 */
export interface GenerationDto {
  generation_id: GenerationEntity["generation_id"];
  generation_duration_ms: GenerationEntity["generation_duration_ms"];
  input_text: GenerationEntity["input_text"];
  model: GenerationEntity["model_used"];
  created_at: GenerationEntity["created_at"];
  proposed_flashcards: FlashcardDto[];
}

/**
 * RegisterUserCommand represents the DTO for registering a new user.
 */
export interface RegisterUserCommand {
  email: string;
  password: string;
}
