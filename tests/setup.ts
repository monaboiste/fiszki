import { afterAll, afterEach, beforeAll, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Extend Vi matchers
expect.extend({
  // Add custom matchers here if needed
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock Service Worker setup
const server = setupServer();

beforeAll(() => {
  // Start the MSW server before all tests
  server.listen({ onUnhandledRequest: "warn" });

  // Mock browser environment globals if needed
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterAll(() => {
  // Close the MSW server after all tests
  server.close();
});

// Make server handlers available for tests
export { server };
