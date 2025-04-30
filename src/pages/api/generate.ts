import { z } from "zod";
import type { APIRoute } from "astro";

import { generateFlashcards } from "../../lib/services/generation.service";

// Input validation schema
const requestSchema = z.object({
  input_text: z.string().min(20, "Input text cannot be empty").max(10000, "Input text cannot exceed 10000 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { input_text } = validationResult.data;

    // Generate flashcards using the service
    const result = await generateFlashcards(input_text, user.id, supabase);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generations endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
