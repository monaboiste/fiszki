import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

// Mockujemy jedynie AlertDialog do kontrolowania warunku wyświetlania
vi.mock("./ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  // Używamy rzeczywistej implementacji dla reszty komponentów
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }) => (
    <button data-testid="alert-dialog-cancel" disabled={disabled} className={className}>
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button data-testid="alert-dialog-action" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

// Minimalizujemy mockowanie i używamy jest.fn() dla setTimeout zamiast ręcznej implementacji
describe("DeleteConfirmationDialog", () => {
  const mockFlashcardId = 123;
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
    vi.resetAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <DeleteConfirmationDialog
        flashcardId={mockFlashcardId}
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByTestId("alert-dialog")).not.toBeInTheDocument();
  });

  it("renders confirmation message when isOpen is true", () => {
    render(
      <DeleteConfirmationDialog
        flashcardId={mockFlashcardId}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByTestId("alert-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("alert-dialog-title")).toHaveTextContent(/are you sure/i);
    expect(screen.getByTestId("alert-dialog-description")).toHaveTextContent(/cannot be undone/i);
    expect(screen.getByTestId("alert-dialog-cancel")).toHaveTextContent(/cancel/i);
    expect(screen.getByTestId("alert-dialog-action")).toHaveTextContent(/delete/i);
  });

  it("calls onConfirm when Delete button is clicked", async () => {
    render(
      <DeleteConfirmationDialog
        flashcardId={mockFlashcardId}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const deleteButton = screen.getByTestId("alert-dialog-action");
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledWith(mockFlashcardId);
    });
  });

  it("shows loading state while delete is in progress", async () => {
    // Używamy kontrolowanej obietnicy do testu stanu ładowania
    const confirmPromise = new Promise<void>((resolve) => {
      // Używamy setTimeout by kontrolować rozwiązanie obietnicy w teście
      setTimeout(resolve, 100);
    });

    const delayedMockOnConfirm = vi.fn().mockImplementation(() => confirmPromise);

    render(
      <DeleteConfirmationDialog
        flashcardId={mockFlashcardId}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={delayedMockOnConfirm}
      />
    );

    // Click delete button
    const deleteButton = screen.getByTestId("alert-dialog-action");
    await userEvent.click(deleteButton);

    // Sprawdzamy stan ładowania
    expect(screen.getByText(/deleting/i)).toBeInTheDocument();

    // Przyciski powinny być wyłączone podczas usuwania
    expect(screen.getByTestId("alert-dialog-cancel")).toBeDisabled();
    expect(screen.getByTestId("alert-dialog-action")).toBeDisabled();

    // Czekamy na zakończenie obietnicy
    await waitFor(() => {
      expect(delayedMockOnConfirm).toHaveBeenCalledWith(mockFlashcardId);
    });
  });

  it("does nothing when flashcardId is null", async () => {
    render(
      <DeleteConfirmationDialog flashcardId={null} isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );

    const deleteButton = screen.getByTestId("alert-dialog-action");
    await userEvent.click(deleteButton);

    // onConfirm nie powinno być wywołane gdy flashcardId jest null
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("handles error during deletion", async () => {
    // Mockujemy odrzucenie obietnicy
    const errorMockOnConfirm = vi.fn().mockRejectedValue(new Error("Delete failed"));

    render(
      <DeleteConfirmationDialog
        flashcardId={mockFlashcardId}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={errorMockOnConfirm}
      />
    );

    // Klikamy przycisk usuwania
    const deleteButton = screen.getByTestId("alert-dialog-action");
    await userEvent.click(deleteButton);

    // onConfirm powinno być wywołane
    await waitFor(() => {
      expect(errorMockOnConfirm).toHaveBeenCalledWith(mockFlashcardId);
    });

    // Powinien wrócić do stanu bez ładowania
    await waitFor(() => {
      expect(screen.queryByText(/deleting/i)).not.toBeInTheDocument();
      // Zamiast szukać po tekście "Delete", używamy jednoznacznego selektora
      const actionButton = screen.getByTestId("alert-dialog-action");
      expect(actionButton).toBeInTheDocument();
      expect(actionButton).not.toBeDisabled();
    });
  });
});
