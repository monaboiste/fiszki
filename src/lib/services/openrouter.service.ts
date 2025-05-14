import type {
  OpenRouterConfig,
  ModelParameters,
  ChatMessage,
  ChatPayload,
  ResponseFormat,
  OpenRouterApiResponse,
} from "./openrouter.types";
import { OpenRouterError } from "./openrouter.types";

/**
 * Service for interacting with the OpenRouter API
 * @class OpenRouterService
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly httpClient: typeof fetch;
  private systemMessage: string;
  private model: string;
  private modelParams: ModelParameters;
  private responseFormat: ResponseFormat;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || "https://openrouter.ai/api/v1/chat/completions";
    this.httpClient = fetch;

    // Initialize default values
    this.systemMessage = config.systemMessage || "You are a helpful AI assistant.";
    this.model = config.model;
    this.modelParams = {
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      ...config.modelParams,
    };

    this.responseFormat = config.responseFormat;
  }

  /**
   * Sends a chat request to the OpenRouter API
   * @param userMessage - The message from the user to send to the API
   * @returns A promise that resolves to the chat response
   * @throws {OpenRouterError} If the request fails or the response is invalid
   */
  public async sendChatRequest(userMessage: string): Promise<OpenRouterApiResponse> {
    try {
      const payload = this.buildPayload(userMessage);
      const response = await this.sendRequest(payload);
      return response;
    } catch (error) {
      // Log detailed error information
      console.error("OpenRouter request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        model: this.model,
        errorCode: error instanceof OpenRouterError ? error.code : undefined,
        errorStatus: error instanceof OpenRouterError ? error.status : undefined,
      });
      throw error;
    }
  }

  /**
   * Sets or updates the system message used in chat requests
   * @param message - The system message to set
   * @throws {OpenRouterError} If the message is empty
   */
  public setSystemMessage(message: string): void {
    if (!message) {
      throw new OpenRouterError("System message cannot be empty");
    }
    this.systemMessage = message;
    console.debug("System message updated", { message });
  }

  /**
   * Sets the response format for API responses
   * @param format - The response format configuration to set
   * @throws {OpenRouterError} If the format is invalid
   */
  public setResponseFormat(format: ResponseFormat): void {
    if (!format || !format.type || !format.json_schema) {
      throw new OpenRouterError("Invalid response format configuration");
    }
    this.responseFormat = format;
    console.debug("Response format updated", { format });
  }

  /**
   * Updates the model name and its parameters
   * @param modelName - The name of the model to use
   * @param parameters - The model parameters to set
   * @throws {OpenRouterError} If the model name is empty
   */
  public setModelParameters(modelName: string, parameters: ModelParameters): void {
    if (!modelName) {
      throw new OpenRouterError("Model name cannot be empty");
    }
    this.model = modelName;
    this.modelParams = {
      ...this.modelParams,
      ...parameters,
    };
    console.debug("Model parameters updated", { model: modelName, parameters });
  }

  /**
   * Returns current model configuration
   * @returns The current model name and parameters
   */
  public getModelConfiguration(): { model: string; parameters: ModelParameters } {
    return {
      model: this.model,
      parameters: { ...this.modelParams },
    };
  }

  /**
   * Builds the chat request payload combining system and user messages
   * @private
   */
  private buildPayload(userMessage: string): ChatPayload {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: this.systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ];

    return {
      model: this.model,
      messages,
      response_format: this.responseFormat,
      ...this.modelParams,
    };
  }

  /**
   * Sends HTTP request to the OpenRouter API with retry logic
   * @private
   */
  private async sendRequest(payload: ChatPayload): Promise<OpenRouterApiResponse> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.info(`Retry attempt ${attempt}/${maxRetries}`);
        }

        const response = await this.httpClient(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
        });
        console.log("response", response);

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          console.error("API request failed", {
            status: response.status,
            statusText: response.statusText,
            error,
            attempt,
          });
          throw new OpenRouterError(error.message || "API request failed", error.code, response.status);
        }

        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) {
          console.error("All retry attempts failed", {
            error: error instanceof Error ? error.message : "Unknown error",
            attempts: maxRetries,
          });
          throw error instanceof OpenRouterError
            ? error
            : new OpenRouterError("Failed to communicate with OpenRouter API");
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
        continue;
      }
    }

    // This should never be reached due to the throw in the catch block
    throw new OpenRouterError("Failed to send request after all retries");
  }
}
