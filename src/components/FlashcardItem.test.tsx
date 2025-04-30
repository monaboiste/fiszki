import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlashcardItem from "./FlashcardItem";
import type { FlashcardProposalViewModel } from "./GenerationsView";

describe("FlashcardItem", () => {
  // Sample flashcard data for tests
  const defaultFlashcard: FlashcardProposalViewModel = {
    front: "Test front",
    back: "Test back",
    type: "ai_generated",
    status: "rejected",
  };

  // Common props
  const defaultProps = {
    flashcard: defaultFlashcard,
    onStatusChange: vi.fn(),
    onEdit: vi.fn(),
    disabled: false,
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render flashcard front and back text in view mode initially", () => {
    render(<FlashcardItem {...defaultProps} />);

    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Test front")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Test back")).toBeInTheDocument();
  });

  it("should display Accept, Reject, Edit buttons in view mode", () => {
    render(<FlashcardItem {...defaultProps} />);

    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should apply correct border style based on flashcard status (accepted)", () => {
    const acceptedFlashcard = { ...defaultFlashcard, status: "accepted" as const };
    render(<FlashcardItem {...defaultProps} flashcard={acceptedFlashcard} />);

    const flashcardElement = screen.getByText("Test front").closest("div.bg-white");
    expect(flashcardElement).toHaveClass("border-green-300");
  });

  it("should apply correct border style based on flashcard status (rejected)", () => {
    const rejectedFlashcard = { ...defaultFlashcard, status: "rejected" as const };
    render(<FlashcardItem {...defaultProps} flashcard={rejectedFlashcard} />);

    const flashcardElement = screen.getByText("Test front").closest("div.bg-white");
    expect(flashcardElement).toHaveClass("border-red-300");
    expect(flashcardElement).toHaveClass("opacity-70");
  });

  it("should apply correct border style based on flashcard status (default)", () => {
    // Setting an invalid status to test default case
    const editedFlashcard = { ...defaultFlashcard, status: "edited" as const };
    render(<FlashcardItem {...defaultProps} flashcard={editedFlashcard} />);

    const flashcardElement = screen.getByText("Test front").closest("div.bg-white");
    expect(flashcardElement).toHaveClass("border-gray-200");
  });

  it("should apply opacity and disable interactions when disabled prop is true", () => {
    render(<FlashcardItem {...defaultProps} disabled={true} />);

    const flashcardElement = screen.getByText("Test front").closest("div.bg-white");
    expect(flashcardElement).toHaveClass("opacity-70");
    expect(flashcardElement).toHaveClass("pointer-events-none");

    const acceptButton = screen.getByText("Accept");
    expect(acceptButton).toBeDisabled();
  });

  it('should call onStatusChange with "accepted" when Accept button is clicked', () => {
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Accept"));

    expect(defaultProps.onStatusChange).toHaveBeenCalledWith("accepted");
  });

  it('should call onStatusChange with "rejected" when Reject button is clicked', () => {
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Reject"));

    expect(defaultProps.onStatusChange).toHaveBeenCalledWith("rejected");
  });

  it("should switch to edit mode when Edit button is clicked", async () => {
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    // Verify edit mode elements are present
    expect(screen.getByLabelText("Front")).toBeInTheDocument();
    expect(screen.getByLabelText("Back")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should render Textarea inputs for front and back in edit mode", () => {
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const frontTextarea = screen.getByLabelText("Front");
    const backTextarea = screen.getByLabelText("Back");

    expect(frontTextarea.tagName).toBe("TEXTAREA");
    expect(backTextarea.tagName).toBe("TEXTAREA");
    expect(frontTextarea).toHaveValue("Test front");
    expect(backTextarea).toHaveValue("Test back");
  });

  it("should render Save and Cancel buttons in edit mode", () => {
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should update internal state for editedFront when front textarea changes", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const frontTextarea = screen.getByLabelText("Front");
    await user.clear(frontTextarea);
    await user.type(frontTextarea, "Updated front");

    expect(frontTextarea).toHaveValue("Updated front");
  });

  it("should update internal state for editedBack when back textarea changes", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const backTextarea = screen.getByLabelText("Back");
    await user.clear(backTextarea);
    await user.type(backTextarea, "Updated back");

    expect(backTextarea).toHaveValue("Updated back");
  });

  it("should display validation error for empty front field", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const frontTextarea = screen.getByLabelText("Front");
    await user.clear(frontTextarea);

    expect(screen.getByText("Front cannot be empty")).toBeInTheDocument();
  });

  it("should display validation error for overlong front field", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const frontTextarea = screen.getByLabelText("Front");
    await user.clear(frontTextarea);
    // Generate string longer than 200 characters
    const longText = "a".repeat(201);
    await user.type(frontTextarea, longText);

    expect(screen.getByText("Front cannot exceed 200 characters")).toBeInTheDocument();
  });

  it("should display validation error for empty back field", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const backTextarea = screen.getByLabelText("Back");
    await user.clear(backTextarea);

    expect(screen.getByText("Back cannot be empty")).toBeInTheDocument();
  });

  it("should display validation error for overlong back field", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const backTextarea = screen.getByLabelText("Back");
    await user.clear(backTextarea);
    // Generate string longer than 500 characters
    const longText = "a".repeat(501);
    await user.type(backTextarea, longText);

    expect(screen.getByText("Back cannot exceed 500 characters")).toBeInTheDocument();
  });

  it("should display character count for front and back during edit", () => {
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByText("10/200 characters")).toBeInTheDocument(); // "Test front" is 10 chars
    expect(screen.getByText("9/500 characters")).toBeInTheDocument(); // "Test back" is 9 chars
  });

  it("should disable Save button in edit mode if validation errors exist", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const frontTextarea = screen.getByLabelText("Front");
    await user.clear(frontTextarea);

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveClass("opacity-50");
  });

  it("should call onEdit with updated flashcard data when Save is clicked", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    const frontTextarea = screen.getByLabelText("Front");
    const backTextarea = screen.getByLabelText("Back");

    await user.clear(frontTextarea);
    await user.type(frontTextarea, "Updated front");
    await user.clear(backTextarea);
    await user.type(backTextarea, "Updated back");

    fireEvent.click(screen.getByText("Save"));

    expect(defaultProps.onEdit).toHaveBeenCalledWith({
      front: "Updated front",
      back: "Updated back",
      type: "ai_generated_modified",
      status: "rejected",
    });
  });

  it("should return to view mode after save button is clicked", async () => {
    const user = userEvent.setup();
    render(<FlashcardItem {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit"));

    // Edit content
    const frontTextarea = screen.getByLabelText("Front");
    await user.clear(frontTextarea);
    await user.type(frontTextarea, "Updated front");

    // Save changes
    fireEvent.click(screen.getByText("Save"));

    // Verify returned to view mode - edit buttons should be visible again
    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should return to view mode after cancel button is clicked", () => {
    render(<FlashcardItem {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit"));

    // Cancel edit
    fireEvent.click(screen.getByText("Cancel"));

    // Verify returned to view mode
    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should reset edited values if flashcard prop changes externally", () => {
    const { rerender } = render(<FlashcardItem {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit"));

    // Change the prop
    const updatedFlashcard = {
      ...defaultFlashcard,
      front: "New front content",
      back: "New back content",
    };

    rerender(<FlashcardItem {...defaultProps} flashcard={updatedFlashcard} />);

    // Check if textarea values have updated
    const frontTextarea = screen.getByLabelText("Front");
    const backTextarea = screen.getByLabelText("Back");

    expect(frontTextarea).toHaveValue("New front content");
    expect(backTextarea).toHaveValue("New back content");
  });
});
