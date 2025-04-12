import type { AIService, AIServiceRequest, AIServiceResponse } from "./types";

export class MockAIService implements AIService {
  async generateFlashcards(request: AIServiceRequest): Promise<AIServiceResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      flashcards: [
        {
          front: "What is the main topic of the text?",
          back: `This text discusses: ${request.prompt.slice(0, 50)}...`,
          type: "ai_generated",
        },
        {
          front: "What are the key points?",
          back: "Key points extracted from the text...",
          type: "ai_generated",
        },
      ],
    };
  }
}
