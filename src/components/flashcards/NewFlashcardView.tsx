import { FlashcardForm } from "./FlashcardForm";

export function NewFlashcardView() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Create new flashcard</h1>
        <div className="bg-white rounded-lg shadow p-6 sm:p-8">
          <FlashcardForm />
        </div>
      </div>
    </div>
  );
}
