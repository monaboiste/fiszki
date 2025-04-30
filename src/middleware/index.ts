import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/auth/login",
  "/auth/register",
  "/auth/confirmation",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/confirm",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request }, next) => {
  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (!user.email) {
      throw new Error("Internal server error: User email is required");
    }
    locals.supabase = supabase;
    locals.user = {
      email: user.email,
      id: user.id,
    };
    return next();
  }

  return new Response(
    JSON.stringify({
      error: "Authentication required",
    }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
});
