import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const validatedData = loginSchema.parse(data);

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) {
      return new Response(
        JSON.stringify({
          error: "Invalid email or password",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(authData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: error.errors[0].message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
