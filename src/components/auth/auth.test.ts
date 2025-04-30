import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, validateConfirmPassword } from "./auth";

describe("validateEmail", () => {
  it("returns isValid: true for valid email", () => {
    const result = validateEmail("test@example.com");
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("returns error for empty input", () => {
    const result = validateEmail("");
    expect(result.isValid).toBe(false);
    expect(result.error).toEqual({
      field: "email",
      message: "Email is required",
    });
  });

  it("returns error for invalid email format", () => {
    const invalidEmails = [
      "plainaddress",
      "@missingusername.com",
      "username@.com",
      "username@domain",
      "username@domain..com",
    ];

    invalidEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        field: "email",
        message: "Please enter a valid email address",
      });
    });
  });
});

describe("validatePassword", () => {
  it("returns isValid: true when length ≥ 8", () => {
    const result = validatePassword("password123");
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("returns error for empty input", () => {
    const result = validatePassword("");
    expect(result.isValid).toBe(false);
    expect(result.error).toEqual({
      field: "password",
      message: "Password is required",
    });
  });

  it("returns error for password shorter than 8 characters", () => {
    const result = validatePassword("short");
    expect(result.isValid).toBe(false);
    expect(result.error).toEqual({
      field: "password",
      message: "Password must be at least 8 characters long",
    });
  });
});

describe("validateConfirmPassword", () => {
  it("returns isValid: true when passwords match", () => {
    const result = validateConfirmPassword("password123", "password123");
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("returns error for empty input", () => {
    const result = validateConfirmPassword("password123", "");
    expect(result.isValid).toBe(false);
    expect(result.error).toEqual({
      field: "confirmPassword",
      message: "Please confirm your password",
    });
  });

  it("returns error for password mismatch", () => {
    const result = validateConfirmPassword("password123", "different");
    expect(result.isValid).toBe(false);
    expect(result.error).toEqual({
      field: "confirmPassword",
      message: "Passwords do not match",
    });
  });
});
