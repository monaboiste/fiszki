import { FlashcardForm } from "./FlashcardForm";

export function NewFlashcardView() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Create new flashcard</h1>
      <FlashcardForm />
    </div>
  );
}
