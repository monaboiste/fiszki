import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NavigationProps {
  user: {
    email: string | null;
  } | null;
}

export default function Navigation({ user }: NavigationProps) {
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
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-xl font-bold text-gray-900">
                10xFiszki
              </a>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.email}</span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline" asChild>
                <a href="/auth/login">Login</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
