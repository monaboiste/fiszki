import type { CreateFlashcardCommand } from "../../../types";

export interface AIServiceRequest {
  prompt: string;
}

export interface AIServiceResponse {
  flashcards: CreateFlashcardCommand[];
}

export interface AIService {
  generateFlashcards(request: AIServiceRequest): Promise<AIServiceResponse>;
}
