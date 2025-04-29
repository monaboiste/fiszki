import { useState } from "react";
import type { LoginFormData, AuthError } from "./auth";
import { validateEmail, validatePassword } from "./auth";

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<keyof LoginFormData>>(new Set());

  const validateField = (field: keyof LoginFormData): void => {
    const value = formData[field];
    let validationResult;

    switch (field) {
      case "email":
        validationResult = validateEmail(value);
        break;
      case "password":
        validationResult = validatePassword(value);
        break;
    }

    if (!validationResult.isValid) {
      setError(validationResult.error);
    } else {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      return false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    // Form will be connected to backend later
    console.log("Login form submitted:", formData);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error?.field === name) {
      setError(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields((prev) => new Set(prev).add(name as keyof LoginFormData));
    validateField(name as keyof LoginFormData);
  };

  const getFieldError = (field: keyof LoginFormData): string | undefined => {
    if (touchedFields.has(field) && error?.field === field) {
      return error.message;
    }
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`block w-full rounded-md border ${
            getFieldError("email") ? "border-red-300" : "border-gray-300"
          } px-4 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          disabled={isLoading}
          aria-invalid={!!getFieldError("email")}
          aria-describedby={getFieldError("email") ? "email-error" : undefined}
        />
        {getFieldError("email") && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            {getFieldError("email")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`block w-full rounded-md border ${
            getFieldError("password") ? "border-red-300" : "border-gray-300"
          } px-4 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          disabled={isLoading}
          aria-invalid={!!getFieldError("password")}
          aria-describedby={getFieldError("password") ? "password-error" : undefined}
        />
        {getFieldError("password") && (
          <p className="mt-2 text-sm text-red-600" id="password-error">
            {getFieldError("password")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create account
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
