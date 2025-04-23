import { Button } from "@/components/ui/button";

interface BulkSaveButtonProps {
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  disableSaveAccepted: boolean;
  isSaving: boolean;
  disabled?: boolean;
}

export default function BulkSaveButton({
  onSaveAll,
  onSaveAccepted,
  disableSaveAccepted,
  isSaving,
  disabled = false,
}: BulkSaveButtonProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onSaveAll}
        disabled={isSaving || disabled}
        variant="default"
        className={isSaving || disabled ? "opacity-50" : "hover:cursor-pointer"}
        aria-label="Save all flashcards"
      >
        {isSaving ? "Saving..." : "Save All"}
      </Button>

      <Button
        onClick={onSaveAccepted}
        disabled={disableSaveAccepted || isSaving || disabled}
        variant="secondary"
        className={disableSaveAccepted || isSaving || disabled ? "opacity-50" : "hover:cursor-pointer"}
        aria-label="Save only accepted flashcards"
      >
        {isSaving ? "Saving..." : "Save Accepted"}
      </Button>
    </div>
  );
}
