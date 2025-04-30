import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BulkSaveButton from "./BulkSaveButton";

describe("BulkSaveButton", () => {
  // Define common props and mocks
  const defaultProps = {
    onSaveAll: vi.fn(),
    onSaveAccepted: vi.fn(),
    disableSaveAccepted: false,
    isSaving: false,
    disabled: false,
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render both "Save All" and "Save Accepted" buttons', () => {
    render(<BulkSaveButton {...defaultProps} />);

    expect(screen.getByText("Save All")).toBeInTheDocument();
    expect(screen.getByText("Save Accepted")).toBeInTheDocument();
  });

  it('should call onSaveAll when "Save All" button is clicked', () => {
    render(<BulkSaveButton {...defaultProps} />);

    fireEvent.click(screen.getByText("Save All"));

    expect(defaultProps.onSaveAll).toHaveBeenCalledTimes(1);
  });

  it('should call onSaveAccepted when "Save Accepted" button is clicked', () => {
    render(<BulkSaveButton {...defaultProps} />);

    fireEvent.click(screen.getByText("Save Accepted"));

    expect(defaultProps.onSaveAccepted).toHaveBeenCalledTimes(1);
  });

  it('should disable "Save All" button when isSaving is true', () => {
    render(<BulkSaveButton {...defaultProps} isSaving={true} />);

    const saveAllButton = screen.getByText("Saving...", { selector: 'button[aria-label="Save all flashcards"]' });

    expect(saveAllButton).toBeDisabled();
  });

  it('should disable "Save All" button when disabled prop is true', () => {
    render(<BulkSaveButton {...defaultProps} disabled={true} />);

    const saveAllButton = screen.getByText("Save All");

    expect(saveAllButton).toBeDisabled();
  });

  it('should disable "Save Accepted" button when isSaving is true', () => {
    render(<BulkSaveButton {...defaultProps} isSaving={true} />);

    const saveAcceptedButton = screen.getByText("Saving...", {
      selector: 'button[aria-label="Save only accepted flashcards"]',
    });

    expect(saveAcceptedButton).toBeDisabled();
  });

  it('should disable "Save Accepted" button when disabled prop is true', () => {
    render(<BulkSaveButton {...defaultProps} disabled={true} />);

    const saveAcceptedButton = screen.getByText("Save Accepted");

    expect(saveAcceptedButton).toBeDisabled();
  });

  it('should disable "Save Accepted" button when disableSaveAccepted prop is true', () => {
    render(<BulkSaveButton {...defaultProps} disableSaveAccepted={true} />);

    const saveAcceptedButton = screen.getByText("Save Accepted");

    expect(saveAcceptedButton).toBeDisabled();
  });

  it('should show "Saving..." text on both buttons when isSaving is true', () => {
    render(<BulkSaveButton {...defaultProps} isSaving={true} />);

    const savingTexts = screen.getAllByText("Saving...");

    expect(savingTexts).toHaveLength(2);
  });

  it("should apply opacity class when buttons are disabled", () => {
    render(<BulkSaveButton {...defaultProps} disabled={true} />);

    const saveAllButton = screen.getByText("Save All");
    const saveAcceptedButton = screen.getByText("Save Accepted");

    expect(saveAllButton).toHaveClass("opacity-50");
    expect(saveAcceptedButton).toHaveClass("opacity-50");
  });

  it('should apply opacity class to "Save Accepted" button when disableSaveAccepted is true', () => {
    render(<BulkSaveButton {...defaultProps} disableSaveAccepted={true} />);

    const saveAcceptedButton = screen.getByText("Save Accepted");

    expect(saveAcceptedButton).toHaveClass("opacity-50");
  });

  it("should have correct aria-labels", () => {
    render(<BulkSaveButton {...defaultProps} />);

    expect(screen.getByLabelText("Save all flashcards")).toBeInTheDocument();
    expect(screen.getByLabelText("Save only accepted flashcards")).toBeInTheDocument();
  });

  it("should apply hover:cursor-pointer class when buttons are enabled", () => {
    render(<BulkSaveButton {...defaultProps} />);

    const saveAllButton = screen.getByText("Save All");
    const saveAcceptedButton = screen.getByText("Save Accepted");

    expect(saveAllButton).toHaveClass("hover:cursor-pointer");
    expect(saveAcceptedButton).toHaveClass("hover:cursor-pointer");
  });
});
