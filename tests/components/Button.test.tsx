import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../src/components/ui/button";
import "@testing-library/jest-dom/vitest";

describe("Button Component", () => {
  it("renders with the correct text", () => {
    // Arrange
    render(<Button>Click me</Button>);

    // Assert
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    // Act
    await user.click(screen.getByRole("button", { name: /click me/i }));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant and size props correctly", () => {
    // Arrange
    render(
      <Button variant="outline" size="sm">
        Small Button
      </Button>
    );

    // Assert
    const button = screen.getByRole("button", { name: /small button/i });
    expect(button.className).toContain("outline");
    expect(button.className).toContain("sm");
  });
});
