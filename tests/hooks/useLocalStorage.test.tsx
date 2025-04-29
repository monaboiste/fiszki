import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Import React for useState
import * as React from "react";

// This is a sample custom hook we're testing
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};

describe("useLocalStorage", () => {
  interface LocalStorageMock {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  }

  const localStorageMock: LocalStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    // Setup localStorage mock before each test
    global.localStorage = localStorageMock as unknown as Storage;
    vi.clearAllMocks();
  });

  it("should use the initial value when no item in localStorage", () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce(null);

    // Act
    const { result } = renderHook(() => useLocalStorage("test-key", "initialValue"));

    // Assert
    expect(result.current[0]).toBe("initialValue");
    expect(localStorageMock.getItem).toHaveBeenCalledWith("test-key");
  });

  it("should use the value from localStorage when available", () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify("storedValue"));

    // Act
    const { result } = renderHook(() => useLocalStorage("test-key", "initialValue"));

    // Assert
    expect(result.current[0]).toBe("storedValue");
  });

  it("should update localStorage when setValue is called", () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce(null);

    // Act
    const { result } = renderHook(() => useLocalStorage("test-key", "initialValue"));

    act(() => {
      result.current[1]("newValue");
    });

    // Assert
    expect(result.current[0]).toBe("newValue");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("test-key", JSON.stringify("newValue"));
  });

  it("should handle update function for setValue", () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify("oldValue"));

    // Act
    const { result } = renderHook(() => useLocalStorage("test-key", "initialValue"));

    act(() => {
      result.current[1]((prev) => `${prev}-updated`);
    });

    // Assert
    expect(result.current[0]).toBe("oldValue-updated");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("test-key", JSON.stringify("oldValue-updated"));
  });
});
