import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
}

export default function GenerateButton({ onClick, disabled, isGenerating }: GenerateButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || isGenerating}
      variant="default"
      size="default"
      className={`${disabled || isGenerating ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}`}
    >
      {isGenerating ? "Generating..." : "Generate Flashcards"}
    </Button>
  );
}
