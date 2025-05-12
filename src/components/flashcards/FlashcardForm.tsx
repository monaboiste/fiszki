import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BulkCreateFlashcardsCommand } from "@/types";
import { toast } from "sonner";

// Form data validation schema
const flashcardSchema = z.object({
  front: z.string().min(1, "Question is required").max(200, "Question must be 200 characters or less"),
  back: z.string().min(1, "Answer is required").max(500, "Answer must be 500 characters or less"),
});

// Form data type
interface FlashcardFormData {
  front: string;
  back: string;
}

// Error type for form validation
interface FlashcardFormErrors {
  front?: string;
  back?: string;
  api?: string;
}

interface ApiError {
  status: number;
  message: string;
  details?: {
    path: string;
    message: string;
  }[];
}

export function FlashcardForm() {
  const [formData, setFormData] = useState<FlashcardFormData>({ front: "", back: "" });
  const [errors, setErrors] = useState<FlashcardFormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, window.innerHeight * 0.5)}px`;
    };

    adjustHeight();

    // Re-adjust when window is resized
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [formData.back]);

  // Check form validity when form data or errors change
  useEffect(() => {
    const frontValid = !!formData.front && !errors.front;
    const backValid = !!formData.back && !errors.back;
    setIsFormValid(frontValid && backValid);
  }, [formData, errors]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Clear the error for this field when user starts typing
    if (errors[name as keyof FlashcardFormErrors]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };

  // Validate a specific field
  const validateField = (field: keyof FlashcardFormData) => {
    try {
      flashcardSchema.shape[field].parse(formData[field]);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message || `Invalid ${field}`;
        setErrors((prev) => ({ ...prev, [field]: message }));
        return false;
      }
      return true;
    }
  };

  // Handle blur event for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    validateField(name as keyof FlashcardFormData);
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const frontIsValid = validateField("front");
    const backIsValid = validateField("back");
    return frontIsValid && backIsValid;
  };

  // Handle API errors
  const handleApiError = (error: ApiError) => {
    // Handle validation errors from API
    if (error.status === 400 && error.details) {
      const apiErrors: FlashcardFormErrors = {};

      error.details.forEach((detail) => {
        if (detail.path && detail.message) {
          const field = detail.path.split(".").pop();
          if (field === "front" || field === "back") {
            apiErrors[field as keyof FlashcardFormErrors] = detail.message;
          }
        }
      });

      setErrors((prev) => ({ ...prev, ...apiErrors }));
      toast.error("Please correct the form errors and try again");
    } else if (error.status === 401) {
      // Redirect to login page if unauthorized
      toast.error("Your session has expired. Please log in again.");
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1000); // 1 second delay to show the toast
    } else {
      // Handle other errors
      setErrors((prev) => ({ ...prev, api: "An error occurred. Please try again." }));
      toast.error(error.message || "An unexpected error occurred");
    }
    setIsLoading(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);

    const request: BulkCreateFlashcardsCommand = {
      flashcards: [
        {
          front: formData.front,
          back: formData.back,
          type: "manual",
        },
      ],
    };

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("error", responseData);
        const apiError: ApiError = {
          status: response.status,
          message: responseData.message || "Failed to create flashcards",
          details: responseData.details || undefined,
        };

        handleApiError(apiError);
        return;
      }

      // Handle success
      toast.success("Flashcard created successfully!");
      setTimeout(() => {
        setFormData({ front: "", back: "" }); // Reset form data
        window.location.href = "/flashcards";
      }, 1000); // 1 second delay to show the toast
    } catch (err) {
      const apiError: ApiError = {
        status: 500,
        message: err instanceof Error ? err.message : "An unexpected error occurred",
      };

      handleApiError(apiError);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-3xl">
      <div className="space-y-2">
        <label htmlFor="front" className="block text-sm font-medium">
          Question
        </label>
        <Input
          id="front"
          name="front"
          value={formData.front}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!errors.front}
          aria-describedby={errors.front ? "front-error" : undefined}
          className={errors.front ? "border-red-500" : ""}
        />
        {errors.front && (
          <p id="front-error" className="text-sm text-red-500">
            {errors.front}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="back" className="block text-sm font-medium">
          Answer
        </label>
        <Textarea
          ref={textareaRef}
          id="back"
          name="back"
          value={formData.back}
          onChange={(e) => {
            handleChange(e);
            // Let the effect handle resizing
          }}
          onBlur={handleBlur}
          aria-invalid={!!errors.back}
          aria-describedby={errors.back ? "back-error" : undefined}
          className={errors.back ? "border-red-500" : ""}
          style={{
            maxHeight: "50vh",
            minHeight: "5rem",
            resize: "none",
          }}
        />
        {errors.back && (
          <p id="back-error" className="text-sm text-red-500">
            {errors.back}
          </p>
        )}
      </div>

      {errors.api && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800">{errors.api}</div>}

      <Button type="submit" disabled={isLoading || !isFormValid} className="w-full sm:w-auto cursor-pointer">
        {isLoading ? "Creating..." : "Create Flashcard"}
      </Button>
    </form>
  );
}
