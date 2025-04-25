export interface OpenRouterConfig {
  apiKey: string;
  endpoint?: string;
  model: string;
  modelParams?: ModelParameters;
  systemMessage?: string;
  responseFormat: ResponseFormat;
}

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatPayload {
  model: string;
  messages: ChatMessage[];
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

export interface OpenRouterApiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    native_finish_reason: string | null;
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}
