export const prerender = false;

import { z } from "zod";
import { MOCK_USER_ID } from "../../../db/supabase.client";
import { createFlashcards } from "../../../lib/services/flashcards.service";
import type { APIRoute } from "astro";

import { supabaseClient } from "../../../db/supabase.client";

// Input validation schema
const requestSchema = z.object({
  flashcards: z
    .array(
      z.object({
        front: z
          .string()
          .min(1, { message: "Front must be at least 1 character" })
          .max(200, { message: "Front must be at most 200 characters" }),
        back: z
          .string()
          .min(1, { message: "Back must be at least 1 character" })
          .max(500, { message: "Back must be at most 500 characters" }),
        type: z.enum(["manual", "ai_generated", "ai_generated_modified"]),
      })
    )
    .nonempty({ message: "At least one flashcard is required" }),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body using Zod (skipping real authentication for now)
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

    // Insert flashcards in a batch operation using Supabase, attaching MOCK_USER_ID
    const { flashcards } = validationResult.data;
    const flashcardsWithUser = flashcards.map((flashcard) => ({ ...flashcard, user_id: MOCK_USER_ID }));

    const responseData = await createFlashcards(flashcardsWithUser, supabaseClient);
    return new Response(JSON.stringify(responseData), { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
