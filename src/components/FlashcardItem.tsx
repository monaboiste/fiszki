import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FlashcardProposalViewModel } from "./GenerationsView";

interface FlashcardItemProps {
  flashcard: FlashcardProposalViewModel;
  onStatusChange: (status: "accepted" | "rejected" | "edited") => void;
  onEdit: (updatedFlashcard: FlashcardProposalViewModel) => void;
  disabled?: boolean;
}

export default function FlashcardItem({ flashcard, onStatusChange, onEdit, disabled = false }: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedFront, setEditedFront] = useState<string>(flashcard.front);
  const [editedBack, setEditedBack] = useState<string>(flashcard.back);
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);

  // Reset edited values when flashcard changes
  useEffect(() => {
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  }, [flashcard]);

  const validateFront = (text: string): boolean => {
    if (text.length === 0) {
      setFrontError("Front cannot be empty");
      return false;
    } else if (text.length > 200) {
      setFrontError("Front cannot exceed 200 characters");
      return false;
    } else {
      setFrontError(null);
      return true;
    }
  };

  const validateBack = (text: string): boolean => {
    if (text.length === 0) {
      setBackError("Back cannot be empty");
      return false;
    } else if (text.length > 500) {
      setBackError("Back cannot exceed 500 characters");
      return false;
    } else {
      setBackError(null);
      return true;
    }
  };

  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEditedFront(text);
    validateFront(text);
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEditedBack(text);
    validateBack(text);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setFrontError(null);
    setBackError(null);
  };

  const handleSaveEdit = () => {
    const isFrontValid = validateFront(editedFront);
    const isBackValid = validateBack(editedBack);

    if (isFrontValid && isBackValid) {
      const updatedFlashcard: FlashcardProposalViewModel = {
        ...flashcard,
        front: editedFront,
        back: editedBack,
        type: "ai_generated_modified",
      };

      onEdit(updatedFlashcard);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 shadow-sm transition h-full ${
        flashcard.status === "accepted"
          ? "border-green-300"
          : flashcard.status === "rejected"
            ? "border-red-300 opacity-70"
            : "border-gray-200"
      } ${disabled ? "opacity-70 pointer-events-none" : ""}`}
    >
      {isEditing ? (
        // Edit Mode
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-front" className="text-sm font-medium">
              Front
            </Label>
            <Textarea
              id="edit-front"
              value={editedFront}
              onChange={handleFrontChange}
              rows={2}
              className={`resize-none ${frontError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {frontError && <p className="mt-1 text-sm text-red-600">{frontError}</p>}
            <p className="mt-1 text-xs text-gray-500">{editedFront.length}/200 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-back" className="text-sm font-medium">
              Back
            </Label>
            <Textarea
              id="edit-back"
              value={editedBack}
              onChange={handleBackChange}
              rows={3}
              className={`resize-none ${backError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {backError && <p className="mt-1 text-sm text-red-600">{backError}</p>}
            <p className="mt-1 text-xs text-gray-500">{editedBack.length}/500 characters</p>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleSaveEdit}
              disabled={!!frontError || !!backError}
              variant={frontError || backError ? "secondary" : "default"}
              className={frontError || backError ? "opacity-50" : ""}
              size="sm"
            >
              Save
            </Button>
            <Button onClick={handleCancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Front</h3>
            <p className="text-base mt-1">{flashcard.front}</p>
          </div>

          <div className="border-t border-gray-200 my-2"></div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Back</h3>
            <p className="text-base mt-1">{flashcard.back}</p>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => onStatusChange("accepted")}
              variant={flashcard.status === "accepted" ? "default" : "outline"}
              className={
                flashcard.status === "accepted"
                  ? "bg-green-600 hover:bg-green-700"
                  : "text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
              }
              size="sm"
              disabled={disabled}
            >
              Accept
            </Button>
            <Button
              onClick={() => onStatusChange("rejected")}
              variant={flashcard.status === "rejected" ? "default" : "outline"}
              className={
                flashcard.status === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : "text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
              }
              size="sm"
              disabled={disabled}
            >
              Reject
            </Button>
            <Button
              onClick={handleEditClick}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
              size="sm"
              disabled={disabled}
            >
              Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
