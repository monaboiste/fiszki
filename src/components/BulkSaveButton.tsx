import { Button } from "@/components/ui/button";

interface BulkSaveButtonProps {
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  disableSaveAccepted: boolean;
  isSaving: boolean;
}

export default function BulkSaveButton({
  onSaveAll,
  onSaveAccepted,
  disableSaveAccepted,
  isSaving,
}: BulkSaveButtonProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onSaveAll}
        disabled={isSaving}
        variant="default"
        className={isSaving ? "opacity-50" : "hover:cursor-pointer"}
        aria-label="Save all flashcards"
      >
        {isSaving ? "Saving..." : "Save All"}
      </Button>

      <Button
        onClick={onSaveAccepted}
        disabled={disableSaveAccepted || isSaving}
        variant="secondary"
        className={disableSaveAccepted || isSaving ? "opacity-50" : "hover:cursor-pointer"}
        aria-label="Save only accepted flashcards"
      >
        {isSaving ? "Saving..." : "Save Accepted"}
      </Button>
    </div>
  );
}
