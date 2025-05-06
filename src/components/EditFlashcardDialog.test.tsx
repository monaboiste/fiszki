import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditFlashcardDialog from "./EditFlashcardDialog";
import type { FlashcardDto } from "../types";

// Mockujemy tylko Dialog, żeby kontrolować warunek wyświetlania
vi.mock("./ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
  DialogClose: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-close">{children}</div>,
}));

// Mockujemy react-hook-form i zod, by lepiej testować walidację
vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual("react-hook-form");
  return {
    ...actual,
    // Potrzebujemy dostępu do rzeczywistej implementacji, ale możemy ją rozszerzyć o testowe funkcjonalności
  };
});

describe("EditFlashcardDialog", () => {
  const mockFlashcard: FlashcardDto = {
    flashcard_id: 1,
    front: "Sample Question",
    back: "Sample Answer",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-02T00:00:00Z",
    type: "text",
    user_id: "user123",
    generation_id: null,
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it("does not render when isOpen is false", () => {
    render(<EditFlashcardDialog flashcard={mockFlashcard} isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("renders with flashcard data when isOpen is true", () => {
    render(<EditFlashcardDialog flashcard={mockFlashcard} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toHaveTextContent("Edit Flashcard");

    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);

    expect(frontInput).toHaveValue("Sample Question");
    expect(backInput).toHaveValue("Sample Answer");
  });

  it("validates form inputs before submission", async () => {
    render(<EditFlashcardDialog flashcard={mockFlashcard} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const saveButton = screen.getByText("Save Changes");

    // Wyczyść pola i spróbuj zapisać
    await userEvent.clear(frontInput);
    await userEvent.clear(backInput);
    await userEvent.click(saveButton);

    // Oczekujemy komunikatów o błędach walidacji
    await waitFor(() => {
      expect(screen.getByText(/front content is required/i)).toBeInTheDocument();
      expect(screen.getByText(/back content is required/i)).toBeInTheDocument();
    });

    // Sprawdź, czy onSave nie zostało wywołane z pustymi danymi
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("submits valid form data", async () => {
    render(<EditFlashcardDialog flashcard={mockFlashcard} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const saveButton = screen.getByText("Save Changes");

    // Zmień wartości pól
    await userEvent.clear(frontInput);
    await userEvent.type(frontInput, "Updated Question");
    await userEvent.clear(backInput);
    await userEvent.type(backInput, "Updated Answer");

    // Zapisz zmiany
    await userEvent.click(saveButton);

    // Sprawdź, czy onSave zostało wywołane z poprawnymi danymi
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(1, {
        front: "Updated Question",
        back: "Updated Answer",
      });
    });
  });
});
