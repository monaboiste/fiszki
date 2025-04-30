import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlashcardsItemList from "./FlashcardsItemList";
import type { FlashcardProposalViewModel } from "./GenerationsView";

vi.mock("./FlashcardItem", () => ({
  default: vi.fn(({ flashcard, onStatusChange, onEdit, disabled }) => (
    <div data-testid="flashcard-item" data-status={flashcard.status} data-disabled={disabled}>
      <button onClick={() => onStatusChange("accepted")}>Accept</button>
      <button onClick={() => onStatusChange("rejected")}>Reject</button>
      <button onClick={() => onEdit({ ...flashcard, front: "edited" })}>Edit</button>
    </div>
  )),
}));

describe("FlashcardsItemList", () => {
  const mockFlashcards: FlashcardProposalViewModel[] = [
    { front: "Front 1", back: "Back 1", type: "ai_generated", status: "rejected" },
    { front: "Front 2", back: "Back 2", type: "ai_generated", status: "accepted" },
    { front: "Front 3", back: "Back 3", type: "ai_generated", status: "edited" },
  ];

  const defaultProps = {
    flashcards: mockFlashcards,
    generationId: 123,
    onStatusChange: vi.fn(),
    onEdit: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(global, "fetch").mockReset();
  });

  it("should render a list of FlashcardItem components based on flashcards prop", () => {
    render(<FlashcardsItemList {...defaultProps} />);

    const flashcardItems = screen.getAllByTestId("flashcard-item");
    expect(flashcardItems).toHaveLength(3);
  });

  it("should render BulkSaveButton", () => {
    render(<FlashcardsItemList {...defaultProps} />);

    expect(screen.getByText("Save All")).toBeInTheDocument();
    expect(screen.getByText("Save Accepted")).toBeInTheDocument();
  });

  it("should pass correct props to FlashcardItem", () => {
    render(<FlashcardsItemList {...defaultProps} />);

    const flashcardItems = screen.getAllByTestId("flashcard-item");
    expect(flashcardItems[0]).toHaveAttribute("data-status", "rejected");
    expect(flashcardItems[1]).toHaveAttribute("data-status", "accepted");
    expect(flashcardItems[2]).toHaveAttribute("data-status", "edited");
  });

  it("should calculate disableSaveAccepted prop correctly", () => {
    const noAcceptedFlashcards: FlashcardProposalViewModel[] = [
      { front: "Front 1", back: "Back 1", type: "ai_generated", status: "rejected" },
    ];

    render(<FlashcardsItemList {...defaultProps} flashcards={noAcceptedFlashcards} />);

    const saveAcceptedButton = screen.getByText("Save Accepted");
    expect(saveAcceptedButton).toBeDisabled();
  });

  it("should call fetch with correct payload on handleSaveAll", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<FlashcardsItemList {...defaultProps} />);

    fireEvent.click(screen.getByText("Save All"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards: mockFlashcards.map(({ front, back, type }) => ({
            front,
            back,
            type,
            generation_id: 123,
          })),
        }),
      });
    });
  });

  it("should call fetch with correct payload on handleSaveAccepted", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<FlashcardsItemList {...defaultProps} />);

    fireEvent.click(screen.getByText("Save Accepted"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards: mockFlashcards
            .filter((card) => card.status === "accepted" || card.status === "edited")
            .map(({ front, back, type }) => ({
              front,
              back,
              type,
              generation_id: 123,
            })),
        }),
      });
    });
  });

  it("should show success message on successful save", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<FlashcardsItemList {...defaultProps} />);

    fireEvent.click(screen.getByText("Save All"));

    await waitFor(() => {
      expect(screen.getByText("Flashcards saved successfully!")).toBeInTheDocument();
    });
  });

  it("should show error message on failed save", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Test error message" }),
    });

    render(<FlashcardsItemList {...defaultProps} />);

    fireEvent.click(screen.getByText("Save All"));

    await waitFor(() => {
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });
  });

  it("should disable elements if hasSaved is true", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<FlashcardsItemList {...defaultProps} />);

    fireEvent.click(screen.getByText("Save All"));

    await waitFor(() => {
      const flashcardItems = screen.getAllByTestId("flashcard-item");
      flashcardItems.forEach((item) => {
        expect(item).toHaveAttribute("data-disabled", "true");
      });
      expect(screen.getByText("Save All")).toBeDisabled();
      expect(screen.getByText("Save Accepted")).toBeDisabled();
    });
  });
});
