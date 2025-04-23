import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextInputAreaProps {
  value: string;
  onChange: (text: string) => void;
  isGenerating: boolean;
}

export default function TextInputArea({ value, onChange, isGenerating }: TextInputAreaProps) {
  const [charCount, setCharCount] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const MIN_CHARS = 20;
  const MAX_CHARS = 10000;

  useEffect(() => {
    // Update character count when value changes
    setCharCount(value.length);

    // Validate input
    if (value.length > 0 && value.length < MIN_CHARS) {
      setValidationError(`Text must be at least ${MIN_CHARS} characters long`);
    } else if (value.length > MAX_CHARS) {
      setValidationError(`Text cannot exceed ${MAX_CHARS} characters`);
    } else {
      setValidationError(null);
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="input-text" className="text-sm font-medium">
          Enter your text to generate flashcards
        </Label>

        <Textarea
          id="input-text"
          value={value}
          onChange={handleTextChange}
          rows={8}
          className={`resize-y max-h-[20vh] ${validationError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          placeholder="Paste or type your text here (minimum 20 characters)"
          disabled={isGenerating}
        />

        <div className="flex justify-between">
          <div>
            {validationError && (
              <p className="text-sm text-red-600" role="alert">
                {validationError}
              </p>
            )}
          </div>
          <div
            className={`text-sm ${
              charCount > MAX_CHARS || (charCount > 0 && charCount < MIN_CHARS) ? "text-red-600" : "text-gray-500"
            }`}
          >
            {charCount}/{MAX_CHARS} characters
          </div>
        </div>
      </div>
    </div>
  );
}
