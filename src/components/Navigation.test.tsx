import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import Navigation from "./Navigation";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("Navigation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(global, "fetch").mockReset();
  });

  it("should display user email when user is logged in", () => {
    render(<Navigation user={{ email: "test@example.com" }} />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("should call logout endpoint when logout button is clicked", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    render(<Navigation user={{ email: "test@example.com" }} />);

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      });
    });
  });

  it("should redirect to login page after successful logout", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    // Mock window.location
    const { location } = window;
    delete window.location;
    window.location = { ...location, href: "" };

    render(<Navigation user={{ email: "test@example.com" }} />);

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(window.location.href).toBe("/auth/login");
    });

    // Restore window.location
    window.location = location;
  });

  it("should show toast on logout failure", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    render(<Navigation user={{ email: "test@example.com" }} />);

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to logout. Please try again.");
    });
  });

  it("should show toast when logout response is not ok", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    render(<Navigation user={{ email: "test@example.com" }} />);

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to logout. Please try again.");
    });
  });
});
