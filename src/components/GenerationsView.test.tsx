import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerationsView from "./GenerationsView";
import type { CreateFlashcardProposalResponseDto } from "../types";
import type { FlashcardProposalViewModel } from "./GenerationsView";

// Mock child components
vi.mock("./TextInputArea", () => ({
  default: vi.fn(({ value, onChange, isGenerating }) => (
    <textarea
      data-testid="text-input-area"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isGenerating}
    />
  )),
}));

vi.mock("./GenerateButton", () => ({
  default: vi.fn(({ onClick, disabled, isGenerating }) => (
    <button onClick={onClick} disabled={disabled || isGenerating} data-testid="generate-button">
      {isGenerating ? "Generating..." : "Generate Flashcards"}
    </button>
  )),
}));

vi.mock("./FlashcardsItemList", () => ({
  default: vi.fn(({ flashcards, onStatusChange, onEdit }) => (
    <div data-testid="flashcards-list">
      {flashcards.map((card: FlashcardProposalViewModel, index: number) => (
        <div key={index} data-testid="flashcard-item" data-status={card.status}>
          <button onClick={() => onStatusChange(index, "accepted")}>Accept</button>
          <button onClick={() => onStatusChange(index, "rejected")}>Reject</button>
          <button onClick={() => onEdit(index, { ...card, front: "edited" })}>Edit</button>
        </div>
      ))}
    </div>
  )),
}));

vi.mock("./SkeletonLoader", () => ({
  default: () => <div data-testid="skeleton-loader">Loading...</div>,
}));

describe("GenerationsView", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(global, "fetch").mockReset();
  });

  it("should render TextInputArea and GenerateButton initially", () => {
    render(<GenerationsView />);

    expect(screen.getByTestId("text-input-area")).toBeInTheDocument();
    expect(screen.getByTestId("generate-button")).toBeInTheDocument();
  });

  it("should update state on input change", async () => {
    const user = userEvent.setup();
    render(<GenerationsView />);

    const input = screen.getByTestId("text-input-area");
    await user.type(input, "Test input text");

    expect(input).toHaveValue("Test input text");
  });

  it("should enable button when input length is valid", async () => {
    const user = userEvent.setup();
    render(<GenerationsView />);

    const input = screen.getByTestId("text-input-area");
    const validText = "a".repeat(20); // Minimum 20 characters
    await user.type(input, validText);

    expect(screen.getByTestId("generate-button")).not.toBeDisabled();
  });

  it("should disable button when input is too short", async () => {
    const user = userEvent.setup();
    render(<GenerationsView />);

    const input = screen.getByTestId("text-input-area");
    await user.type(input, "Short text");

    expect(screen.getByTestId("generate-button")).toBeDisabled();
  });

  it("should handle errors", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Test error message" }),
    });

    const user = userEvent.setup();
    render(<GenerationsView />);

    const input = screen.getByTestId("text-input-area");
    await user.type(input, "a".repeat(20));

    fireEvent.click(screen.getByTestId("generate-button"));

    await waitFor(() => {
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });
  });

  it("should transform and display API response", async () => {
    const mockResponse: CreateFlashcardProposalResponseDto = {
      generation_id: 1,
      proposed_flashcards: [
        { front: "Front 1", back: "Back 1", type: "ai_generated" },
        { front: "Front 2", back: "Back 2", type: "ai_generated" },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const user = userEvent.setup();
    render(<GenerationsView />);

    const input = screen.getByTestId("text-input-area");
    await user.type(input, "a".repeat(20));

    fireEvent.click(screen.getByTestId("generate-button"));

    await waitFor(() => {
      const flashcardItems = screen.getAllByTestId("flashcard-item");
      expect(flashcardItems).toHaveLength(2);
      // Verify default status is rejected
      flashcardItems.forEach((item) => {
        expect(item).toHaveAttribute("data-status", "rejected");
      });
    });
  });

  it("should manage flashcard status changes", async () => {
    const mockResponse: CreateFlashcardProposalResponseDto = {
      generation_id: 1,
      proposed_flashcards: [{ front: "Front 1", back: "Back 1", type: "ai_generated" }],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const user = userEvent.setup();
    render(<GenerationsView />);

    // Generate flashcards
    const input = screen.getByTestId("text-input-area");
    await user.type(input, "a".repeat(20));
    fireEvent.click(screen.getByTestId("generate-button"));

    // Wait for flashcards to appear
    await waitFor(() => {
      expect(screen.getByTestId("flashcards-list")).toBeInTheDocument();
    });

    // Change status
    fireEvent.click(screen.getByText("Accept"));

    await waitFor(() => {
      expect(screen.getByTestId("flashcard-item")).toHaveAttribute("data-status", "accepted");
    });
  });

  it("should manage flashcard edits", async () => {
    const mockResponse: CreateFlashcardProposalResponseDto = {
      generation_id: 1,
      proposed_flashcards: [{ front: "Front 1", back: "Back 1", type: "ai_generated" }],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const user = userEvent.setup();
    render(<GenerationsView />);

    // Generate flashcards
    const input = screen.getByTestId("text-input-area");
    await user.type(input, "a".repeat(20));
    fireEvent.click(screen.getByTestId("generate-button"));

    // Wait for flashcards to appear
    await waitFor(() => {
      expect(screen.getByTestId("flashcards-list")).toBeInTheDocument();
    });

    // Edit flashcard
    fireEvent.click(screen.getByText("Edit"));

    await waitFor(() => {
      expect(screen.getByTestId("flashcard-item")).toHaveAttribute("data-status", "edited");
    });
  });
});
