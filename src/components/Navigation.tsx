import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface NavigationProps {
  user: {
    email: string | null;
  } | null;
}

export default function Navigation({ user }: NavigationProps) {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const isActive = (path: string) => {
    return currentPath === path;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      window.location.href = "/auth/login";
    } catch (error) {
      console.error(error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-xl font-bold text-gray-900">
              10xFiszki
            </a>
          </div>

          {/* Center section - Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            {user && (
              <div className="flex space-x-8 justify-center">
                <Button
                  variant={isActive("/generate") ? "default" : "ghost"}
                  asChild
                  className={isActive("/generate") ? "pointer-events-none" : ""}
                  aria-current={isActive("/generate") ? "page" : undefined}
                >
                  <a href="/generate" className="text-gray-700 hover:text-gray-900">
                    Generate
                  </a>
                </Button>
                <Button
                  variant={isActive("/flashcards/new") ? "default" : "ghost"}
                  asChild
                  className={isActive("/flashcards/new") ? "pointer-events-none" : ""}
                  aria-current={isActive("/flashcards/new") ? "page" : undefined}
                >
                  <a href="/flashcards/new" className="text-gray-700 hover:text-gray-900">
                    Create Flashcard
                  </a>
                </Button>
                <Button
                  variant={isActive("/flashcards") ? "default" : "ghost"}
                  asChild
                  className={isActive("/flashcards") ? "pointer-events-none" : ""}
                  aria-current={isActive("/flashcards") ? "page" : undefined}
                >
                  <a href="/flashcards" className="text-gray-700 hover:text-gray-900">
                    My Flashcards
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Right section - User info and logout */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-700 mr-2">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/login">Login</a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {user && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <a
              href="/generate"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/generate")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Generate
            </a>
            <a
              href="/flashcards/new"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/flashcards/new")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Create Flashcard
            </a>
            <a
              href="/flashcards"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/flashcards")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              My Flashcards
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
