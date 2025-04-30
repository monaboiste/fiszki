/**
 * Base interface for authentication form data
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Extended interface for registration form data
 */
export interface RegisterFormData extends LoginFormData {
  confirmPassword: string;
}

/**
 * Represents an authentication form validation error
 */
export interface AuthError {
  field: keyof LoginFormData | "confirmPassword";
  message: string;
}

/**
 * Result of form field validation
 */
export interface ValidationResult {
  isValid: boolean;
  error: AuthError | null;
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return {
      isValid: false,
      error: {
        field: "email",
        message: "Email is required",
      },
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@.]+(?:\.[^\s@.]+)*$/;
  const isValid = emailRegex.test(email);
  if (!isValid) {
    return {
      isValid: false,
      error: {
        field: "email",
        message: "Please enter a valid email address",
      },
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Validation result with error message if invalid
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: {
        field: "password",
        message: "Password is required",
      },
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: {
        field: "password",
        message: "Password must be at least 8 characters long",
      },
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates if password confirmation matches the password
 * @param password - Original password
 * @param confirmPassword - Password confirmation to validate
 * @returns Validation result with error message if invalid
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return {
      isValid: false,
      error: {
        field: "confirmPassword",
        message: "Please confirm your password",
      },
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: {
        field: "confirmPassword",
        message: "Passwords do not match",
      },
    };
  }

  return { isValid: true, error: null };
};
