import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "./openrouter.service";
import type { OpenRouterConfig, ResponseFormat } from "./openrouter.types";

describe("OpenRouterService", () => {
  // Mock fetch for all tests
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  // Create a valid response format for tests
  const mockResponseFormat: ResponseFormat = {
    type: "json_schema" as const,
    json_schema: {
      name: "test_schema",
      strict: true,
      schema: { type: "object" },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;

    // Suppress console output
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should validate constructor config", () => {
    // Valid configuration
    const validConfig: OpenRouterConfig = {
      apiKey: "test-api-key",
      model: "test-model",
      responseFormat: mockResponseFormat,
    };

    expect(() => new OpenRouterService(validConfig)).not.toThrow();
  });

  it("should update internal parameters", () => {
    const service = new OpenRouterService({
      apiKey: "test-api-key",
      model: "test-model",
      responseFormat: mockResponseFormat,
    });

    // Test setSystemMessage
    const newSystemMessage = "New system message";
    service.setSystemMessage(newSystemMessage);
    expect(() => service.setSystemMessage("")).toThrow();

    // Test setModelParameters
    const newParams = {
      temperature: 0.5,
      max_tokens: 100,
    };
    service.setModelParameters("new-model", newParams);
    expect(service.getModelConfiguration()).toEqual({
      model: "new-model",
      parameters: expect.objectContaining(newParams),
    });
    expect(() => service.setModelParameters("", newParams)).toThrow();

    // Test setResponseFormat
    service.setResponseFormat(mockResponseFormat);
    expect(() => service.setResponseFormat({} as ResponseFormat)).toThrow();
  });

  it("should build payload and send chat requests", async () => {
    const service = new OpenRouterService({
      apiKey: "test-api-key",
      model: "test-model",
      systemMessage: "Test system message",
      responseFormat: mockResponseFormat,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "response-id",
          choices: [{ message: { content: "Test response" } }],
        }),
    });

    const response = await service.sendChatRequest("Test user message");

    // Verify request was made correctly
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-key",
        }),
        body: expect.stringContaining("Test user message"),
      })
    );

    // Verify response handling
    expect(response).toEqual({
      id: "response-id",
      choices: [{ message: { content: "Test response" } }],
    });
  });

  it("should retry on failures", async () => {
    const service = new OpenRouterService({
      apiKey: "test-api-key",
      model: "test-model",
      responseFormat: mockResponseFormat,
    });

    // First call fails, second succeeds
    mockFetch.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "response-id",
          choices: [{ message: { content: "Test response" } }],
        }),
    });

    const response = await service.sendChatRequest("Test message");

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(response).toEqual({
      id: "response-id",
      choices: [{ message: { content: "Test response" } }],
    });
  });
});
