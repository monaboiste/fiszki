import { vi } from "vitest";
import type { ClassValue } from "clsx";

// Mock version of src/lib/utils.ts
export const cn = vi.fn((...inputs: ClassValue[]) => inputs.join(" "));

// Export any other utility functions needed from the original module
export const formatDate = vi.fn((date: Date) => date.toISOString());
export const isValidEmail = vi.fn((email: string) => email.includes("@"));
