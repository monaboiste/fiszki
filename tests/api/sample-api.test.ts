import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../setup";

describe("API Tests", () => {
  beforeEach(() => {
    // Reset handlers before each test
    server.resetHandlers();
  });

  it("fetches user data successfully", async () => {
    // Arrange - Setup mock API response
    server.use(
      http.get("/api/user", () => {
        return HttpResponse.json({
          id: "123",
          name: "Test User",
          email: "test@example.com",
        });
      })
    );

    // Act - Fetch the data
    const response = await fetch("/api/user");
    const data = await response.json();

    // Assert - Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: "123",
      name: "Test User",
      email: "test@example.com",
    });
  });

  it("handles API errors correctly", async () => {
    // Arrange - Setup mock API error response
    server.use(
      http.get("/api/user", () => {
        return new HttpResponse(null, {
          status: 500,
          statusText: "Internal Server Error",
        });
      })
    );

    // Act - Fetch the data
    const response = await fetch("/api/user");

    // Assert - Verify error handling
    expect(response.status).toBe(500);
    expect(response.ok).toBe(false);
  });
});
