import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GenerateButton from "./GenerateButton";

describe("GenerateButton", () => {
  const defaultProps = {
    onClick: vi.fn(),
    disabled: false,
    isGenerating: false,
  };

  it('should render with "Generate Flashcards" text when not generating', () => {
    render(<GenerateButton {...defaultProps} />);

    expect(screen.getByText("Generate Flashcards")).toBeInTheDocument();
  });

  it('should render with "Generating..." text when generating', () => {
    render(<GenerateButton {...defaultProps} isGenerating={true} />);

    expect(screen.getByText("Generating...")).toBeInTheDocument();
  });

  it("should call onClick handler when clicked", () => {
    render(<GenerateButton {...defaultProps} />);

    fireEvent.click(screen.getByText("Generate Flashcards"));

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<GenerateButton {...defaultProps} disabled={true} />);

    expect(screen.getByText("Generate Flashcards")).toBeDisabled();
  });

  it("should be disabled when isGenerating is true", () => {
    render(<GenerateButton {...defaultProps} isGenerating={true} />);

    expect(screen.getByText("Generating...")).toBeDisabled();
  });

  it("should apply opacity class when generating", () => {
    render(<GenerateButton {...defaultProps} isGenerating={true} />);

    expect(screen.getByText("Generating...")).toHaveClass("opacity-50");
  });

  it("should apply cursor-not-allowed class when disabled", () => {
    render(<GenerateButton {...defaultProps} disabled={true} />);

    expect(screen.getByText("Generate Flashcards")).toHaveClass("cursor-not-allowed");
  });

  it("should apply cursor-not-allowed class when generating", () => {
    render(<GenerateButton {...defaultProps} isGenerating={true} />);

    expect(screen.getByText("Generating...")).toHaveClass("cursor-not-allowed");
  });
});
