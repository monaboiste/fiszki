import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FlashcardDto, UpdateFlashcardCommand } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";

// Validation schema
const flashcardSchema = z.object({
  front: z.string().min(1, "Front content is required").max(200, "Front content must be at most 200 characters"),
  back: z.string().min(1, "Back content is required").max(500, "Back content must be at most 500 characters"),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

interface EditFlashcardDialogProps {
  flashcard: FlashcardDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: UpdateFlashcardCommand) => Promise<void>;
}

const EditFlashcardDialog: React.FC<EditFlashcardDialogProps> = ({ flashcard, isOpen, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      front: flashcard?.front || "",
      back: flashcard?.back || "",
    },
  });

  // Reset form when flashcard changes
  useEffect(() => {
    if (flashcard) {
      reset({
        front: flashcard.front,
        back: flashcard.back,
      });
    }
  }, [flashcard, reset]);

  // Handle form submission
  const onSubmit = async (data: FlashcardFormData) => {
    if (!flashcard) return;

    try {
      await onSave(flashcard.flashcard_id, data);
    } catch (error) {
      if (error instanceof Error) {
        setError("root", {
          type: "manual",
          message: error.message || "Failed to save flashcard. Please try again.",
        });
      } else {
        setError("root", {
          type: "manual",
          message: "An unknown error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">
              Front <span className="text-red-500">*</span>
            </Label>
            <Input id="front" placeholder="Front content" {...register("front")} disabled={isSubmitting} />
            {errors.front && <p className="text-sm text-red-500">{errors.front.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">
              Back <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="back"
              placeholder="Back content"
              className="min-h-[120px] max-h-[60vh] resize-y"
              {...register("back")}
              disabled={isSubmitting}
            />
            {errors.back && <p className="text-sm text-red-500">{errors.back.message}</p>}
          </div>

          {errors.root && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <DialogFooter className="gap-4 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting} className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFlashcardDialog;
