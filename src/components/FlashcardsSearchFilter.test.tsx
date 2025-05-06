import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FlashcardsSearchFilter from "./FlashcardsSearchFilter";

// Nie będziemy mockować funkcji debounce, ale ustawimy szybszy timeout dla testów
vi.useFakeTimers();

describe("FlashcardsSearchFilter", () => {
  const mockOnSearchChange = vi.fn();

  beforeEach(() => {
    mockOnSearchChange.mockClear();
    vi.clearAllTimers();
  });

  it("renders correctly with the provided search term", () => {
    render(<FlashcardsSearchFilter searchTerm="test query" onSearchChange={mockOnSearchChange} />);

    const inputElement = screen.getByLabelText(/search flashcards/i);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue("test query");
  });

  it("calls onSearchChange after debounce timeout when input value changes", () => {
    render(<FlashcardsSearchFilter searchTerm="" onSearchChange={mockOnSearchChange} />);

    const inputElement = screen.getByLabelText(/search flashcards/i);

    // Use fireEvent instead of userEvent to avoid timeout issues
    fireEvent.change(inputElement, { target: { value: "new search" } });

    // Debounce ma domyślnie 300ms opóźnienia, więc przyspieszamy czas
    vi.advanceTimersByTime(350);

    // Sprawdzamy czy onSearchChange zostało wywołane z odpowiednim argumentem
    expect(mockOnSearchChange).toHaveBeenCalledWith("new search");
  });

  it("updates input value when searchTerm prop changes", () => {
    const { rerender } = render(<FlashcardsSearchFilter searchTerm="initial" onSearchChange={mockOnSearchChange} />);

    const inputElement = screen.getByLabelText(/search flashcards/i);
    expect(inputElement).toHaveValue("initial");

    // Update the component with a new searchTerm prop
    rerender(<FlashcardsSearchFilter searchTerm="updated" onSearchChange={mockOnSearchChange} />);

    expect(inputElement).toHaveValue("updated");
  });

  it("debounces search to avoid excessive callbacks", () => {
    render(<FlashcardsSearchFilter searchTerm="" onSearchChange={mockOnSearchChange} />);

    const inputElement = screen.getByLabelText(/search flashcards/i);

    // Symulujemy wpisywanie tekstu poprzez bezpośrednie zmiany wartości
    fireEvent.change(inputElement, { target: { value: "a" } });
    vi.advanceTimersByTime(100);

    fireEvent.change(inputElement, { target: { value: "ab" } });
    vi.advanceTimersByTime(100);

    fireEvent.change(inputElement, { target: { value: "abc" } });

    // Sprawdzamy, że funkcja nie została jeszcze wywołana przed pełnym timeoutem
    expect(mockOnSearchChange).not.toHaveBeenCalled();

    // Teraz przyspieszamy czas do pełnego debounce timeout
    vi.advanceTimersByTime(300);

    // Funkcja powinna być wywołana raz z ostatnią wartością
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    expect(mockOnSearchChange).toHaveBeenCalledWith("abc");
  });
});
