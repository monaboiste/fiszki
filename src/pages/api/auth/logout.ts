import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    await supabase.auth.signOut();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
