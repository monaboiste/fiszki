// Error codes for generation service
export const GenerationErrorCode = {
  UNKNOWN: "UNKNOWN",
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

export type GenerationErrorCode = (typeof GenerationErrorCode)[keyof typeof GenerationErrorCode];

// Base error class for generation service
export class GenerationError extends Error {
  constructor(
    public readonly code: GenerationErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "GenerationError";
  }

  public toErrorDescription(): string {
    const causeMessage = this.cause instanceof Error ? `: ${this.cause.message}` : "";
    return `${this.message}${causeMessage}`;
  }
}
