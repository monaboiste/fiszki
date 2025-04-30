import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextInputArea from "./TextInputArea";

describe("TextInputArea", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    isGenerating: false,
  };

  it("should show validation error when text is too long", async () => {
    render(<TextInputArea {...defaultProps} value={"a".repeat(10001)} />);

    expect(screen.getByText("Text cannot exceed 10000 characters")).toBeInTheDocument();
  });

  it("should be disabled when isGenerating is true", () => {
    render(<TextInputArea {...defaultProps} isGenerating={true} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should apply error styles when text is too long", () => {
    render(<TextInputArea {...defaultProps} value={"a".repeat(10001)} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("border-red-500");
    expect(textarea).toHaveClass("focus-visible:ring-red-500");
  });

  it("should apply normal styles when text length is valid", async () => {
    const user = userEvent.setup();
    render(<TextInputArea {...defaultProps} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "This is a valid input text that is long enough");

    expect(textarea).not.toHaveClass("border-red-500");
    expect(textarea).not.toHaveClass("focus-visible:ring-red-500");
  });

  it("should show placeholder text", () => {
    render(<TextInputArea {...defaultProps} />);

    expect(screen.getByPlaceholderText(/paste or type your text/i)).toBeInTheDocument();
  });
});
