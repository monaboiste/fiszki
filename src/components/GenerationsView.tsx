import { useState } from "react";
import type {
  CreateFlashcardCommand,
  RequestFlashcardGenerationCommand,
  CreateFlashcardProposalResponseDto,
} from "../types";
import TextInputArea from "./TextInputArea";
import GenerateButton from "./GenerateButton";
import FlashcardsItemList from "./FlashcardsItemList";
import SkeletonLoader from "./SkeletonLoader";

export type FlashcardProposalViewModel = CreateFlashcardCommand & {
  status: "accepted" | "rejected" | "edited";
};

export interface GenerationViewModel {
  generation_id: number;
  input_text: string;
  proposed_flashcards: FlashcardProposalViewModel[];
}

export default function GenerationsView() {
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationViewModel | null>(null);

  const handleInputChange = (text: string) => {
    setInputText(text);
    // Reset error when user starts typing again
    if (error) setError(null);
  };

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: RequestFlashcardGenerationCommand = {
        input_text: inputText,
      };

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("errorData", errorData);
        throw new Error(errorData.error || "Failed to generate flashcards");
      }

      const data: CreateFlashcardProposalResponseDto = await response.json();

      // Transform API response to view model with status for each flashcard
      const viewModel: GenerationViewModel = {
        generation_id: data.generation_id,
        input_text: inputText,
        proposed_flashcards: data.proposed_flashcards.map((flashcard) => ({
          ...flashcard,
          status: "rejected", // Default status is rejected
        })),
      };

      setGenerationResult(viewModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Error generating flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlashcardStatusChange = (index: number, status: "accepted" | "rejected" | "edited") => {
    if (!generationResult) return;

    setGenerationResult({
      ...generationResult,
      proposed_flashcards: generationResult.proposed_flashcards.map((flashcard, i) =>
        i === index ? { ...flashcard, status } : flashcard
      ),
    });
  };

  const handleFlashcardEdit = (index: number, updatedFlashcard: FlashcardProposalViewModel) => {
    if (!generationResult) return;

    setGenerationResult({
      ...generationResult,
      proposed_flashcards: generationResult.proposed_flashcards.map((flashcard, i) =>
        i === index ? { ...updatedFlashcard, status: "edited" } : flashcard
      ),
    });
  };

  // Check if input is valid for generation
  const isValidForGeneration = inputText.length >= 20 && inputText.length <= 10000;

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <TextInputArea value={inputText} onChange={handleInputChange} isGenerating={isLoading} />

        <GenerateButton onClick={handleGenerateFlashcards} disabled={!isValidForGeneration} isGenerating={isLoading} />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      {isLoading && <SkeletonLoader />}

      {!isLoading && generationResult && (
        <FlashcardsItemList
          flashcards={generationResult.proposed_flashcards}
          generationId={generationResult.generation_id}
          onStatusChange={handleFlashcardStatusChange}
          onEdit={handleFlashcardEdit}
        />
      )}
    </div>
  );
}
