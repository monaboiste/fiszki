import { z } from "zod";
import type { APIRoute } from "astro";

import { supabaseClient } from "../../../db/supabase.client";
import { MOCK_USER_ID } from "../../../db/supabase.client";
import { generateFlashcards } from "../../../lib/services/generation.service";

// Input validation schema
const requestSchema = z.object({
  input_text: z.string().min(1, "Input text cannot be empty").max(10000, "Input text cannot exceed 10000 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
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
    const result = await generateFlashcards(input_text, MOCK_USER_ID, supabaseClient);

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
