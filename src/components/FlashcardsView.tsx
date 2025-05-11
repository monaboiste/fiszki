import React, { useState, useEffect, useCallback } from "react";
import type { FlashcardDto, FlashcardsListResponseDto, UpdateFlashcardCommand } from "../types";
import FlashcardsSearchFilter from "./FlashcardsSearchFilter";
import FlashcardsList from "./FlashcardsList";
import EditFlashcardDialog from "./EditFlashcardDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { toast } from "sonner";

// Types
interface FilterState {
  searchTerm: string;
  page: number;
  limit: number;
  sort: "created_at" | "updated_at";
  sort_direction: "asc" | "desc";
}

type ViewState = "idle" | "loading" | "error" | "submitting";

interface ErrorState {
  message: string | null;
  details?: unknown;
}

const FlashcardsView: React.FC = () => {
  // State management
  const [flashcardsData, setFlashcardsData] = useState<FlashcardsListResponseDto | null>(null);
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [error, setError] = useState<ErrorState | null>(null);
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: "",
    page: 1,
    limit: 3 * 4,
    sort: "updated_at",
    sort_direction: "desc",
  });

  // Dialog states
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDto | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingFlashcardId, setDeletingFlashcardId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filtered flashcards (client-side filtering by searchTerm)
  const filteredFlashcards =
    flashcardsData?.flashcards.filter(
      (flashcard) =>
        !filterState.searchTerm || flashcard.front.toLowerCase().includes(filterState.searchTerm.toLowerCase())
    ) || [];

  // Fetch flashcards data
  const fetchFlashcards = useCallback(async () => {
    setViewState("loading");
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: filterState.page.toString(),
        limit: filterState.limit.toString(),
        sort: filterState.sort,
        sort_direction: filterState.sort_direction,
      });

      const response = await fetch(`/api/flashcards?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch flashcards: ${response.status}`);
      }

      const data: FlashcardsListResponseDto = await response.json();
      setFlashcardsData(data);
      setViewState("idle");
    } catch (error: unknown) {
      console.error("Error fetching flashcards:", error);
      setError({
        message: error instanceof Error ? error.message : "Failed to fetch flashcards. Please try again later.",
      });
      setViewState("error");
    }
  }, [filterState.page, filterState.limit, filterState.sort, filterState.sort_direction]);

  // Initial data load
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Handle search filter change (with debounce)
  const handleSearchChange = useCallback((term: string) => {
    setFilterState((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  // Handle pagination change
  const handlePageChange = useCallback((page: number) => {
    setFilterState((prev) => ({ ...prev, page }));
  }, []);

  // Handle edit flashcard
  const handleEditFlashcard = useCallback(
    (id: number) => {
      const flashcard = flashcardsData?.flashcards.find((f) => f.flashcard_id === id);
      if (flashcard) {
        setEditingFlashcard(flashcard);
        setIsEditDialogOpen(true);
      }
    },
    [flashcardsData?.flashcards]
  );

  // Handle save edited flashcard
  const handleSaveFlashcard = async (id: number, data: UpdateFlashcardCommand) => {
    try {
      setViewState("submitting");

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Flashcard not found. It may have been deleted.");
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to update flashcard: ${response.status}`);
        }
      } else {
        toast.success("Flashcard updated successfully");
        setIsEditDialogOpen(false);
        setEditingFlashcard(null);
        fetchFlashcards();
      }

      setViewState("idle");
    } catch (error: unknown) {
      console.error("Error updating flashcard:", error);
      setError({
        message: error instanceof Error ? error.message : "Failed to update flashcard. Please try again later.",
      });
      setViewState("idle");
      return Promise.reject(error);
    }
  };

  // Handle delete flashcard
  const handleDeleteFlashcard = useCallback((id: number) => {
    setDeletingFlashcardId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = async (id: number) => {
    try {
      setViewState("submitting");

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Flashcard not found. It may have been deleted already.");
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to delete flashcard: ${response.status}`);
        }
      } else {
        toast.success("Flashcard deleted successfully");
        setIsDeleteDialogOpen(false);
        setDeletingFlashcardId(null);
        fetchFlashcards();
      }

      setViewState("idle");
    } catch (error: unknown) {
      console.error("Error deleting flashcard:", error);
      setError({
        message: error instanceof Error ? error.message : "Failed to delete flashcard. Please try again later.",
      });
      setViewState("idle");
      return Promise.reject(error);
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    fetchFlashcards();
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="flashcards-view-page">
      <h1 className="text-3xl font-bold mb-6">My Flashcards</h1>

      <div className="mb-6">
        <FlashcardsSearchFilter searchTerm={filterState.searchTerm} onSearchChange={handleSearchChange} />
      </div>

      {viewState === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error?.message || "An error occurred"}</p>
          <button
            onClick={handleRetry}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      <FlashcardsList
        flashcards={filteredFlashcards}
        isLoading={viewState === "loading"}
        pagination={{
          page: filterState.page,
          limit: filterState.limit,
          total: flashcardsData?.total || 0,
        }}
        onEdit={handleEditFlashcard}
        onDelete={handleDeleteFlashcard}
        onPageChange={handlePageChange}
      />

      {editingFlashcard && (
        <EditFlashcardDialog
          flashcard={editingFlashcard}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingFlashcard(null);
          }}
          onSave={handleSaveFlashcard}
        />
      )}

      <DeleteConfirmationDialog
        flashcardId={deletingFlashcardId}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingFlashcardId(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default FlashcardsView;
