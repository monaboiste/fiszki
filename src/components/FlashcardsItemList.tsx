import { useState } from "react";
import type { BulkCreateFlashcardsCommand } from "../types";
import type { FlashcardProposalViewModel } from "./GenerationsView";
import FlashcardItem from "./FlashcardItem";
import BulkSaveButton from "./BulkSaveButton";

interface FlashcardsItemListProps {
  flashcards: FlashcardProposalViewModel[];
  generationId: number;
  onStatusChange: (index: number, status: "accepted" | "rejected" | "edited") => void;
  onEdit: (index: number, updatedFlashcard: FlashcardProposalViewModel) => void;
}

export default function FlashcardsItemList({
  flashcards,
  generationId,
  onStatusChange,
  onEdit,
}: FlashcardsItemListProps) {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  const handleSaveAll = async () => {
    await saveFlashcards(flashcards);
  };

  const handleSaveAccepted = async () => {
    const acceptedFlashcards = flashcards.filter((card) => card.status === "accepted" || card.status === "edited");
    await saveFlashcards(acceptedFlashcards);
  };

  const saveFlashcards = async (cardsToSave: FlashcardProposalViewModel[]) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    setHasSaved(false);

    try {
      const payload: BulkCreateFlashcardsCommand = {
        flashcards: cardsToSave.map(({ front, back, type }) => ({
          front,
          back,
          type: type || "ai_generated",
          generation_id: generationId,
        })),
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("errorData", errorData);
        throw new Error(errorData.error || "Failed to save flashcards");
      }

      setSaveSuccess(true);
      setHasSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "An unexpected error occurred while saving");
      console.error("Error saving flashcards:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Count of accepted and edited cards
  const acceptedCount = flashcards.filter((card) => card.status === "accepted" || card.status === "edited").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Generated Flashcards</h2>
        <BulkSaveButton
          onSaveAll={handleSaveAll}
          onSaveAccepted={handleSaveAccepted}
          disableSaveAccepted={acceptedCount === 0}
          isSaving={isSaving}
          disabled={hasSaved}
        />
      </div>

      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{saveError}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
          <p>Flashcards saved successfully!</p>
        </div>
      )}

      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((flashcard, index) => (
          <FlashcardItem
            key={index}
            flashcard={flashcard}
            onStatusChange={(status: "accepted" | "rejected" | "edited") => onStatusChange(index, status)}
            onEdit={(updatedFlashcard: FlashcardProposalViewModel) => onEdit(index, updatedFlashcard)}
            disabled={hasSaved}
          />
        ))}
      </div>
    </div>
  );
}
