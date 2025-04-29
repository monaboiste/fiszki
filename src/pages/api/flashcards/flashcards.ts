export const prerender = false;

import { z } from "zod";
import { MOCK_USER_ID } from "../../../db/supabase.client";
import { createFlashcards } from "../../../lib/services/flashcards.service";
import type { APIRoute } from "astro";

// Input validation schema
const requestSchema = z.object({
  flashcards: z
    .array(
      z.object({
        front: z.string().min(1, "Front must be at least 1 character").max(200, "Front must be at most 200 characters"),
        back: z.string().min(1, "Back must be at least 1 character").max(500, "Back must be at most 500 characters"),
        type: z.enum(["manual", "ai_generated", "ai_generated_modified"]),
        generation_id: z.number().int().positive().nullable(),
      })
    )
    .nonempty("At least one flashcard is required"),
});

export const POST: APIRoute = async ({ request, locals }) => {
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

    const responseData = await createFlashcards(flashcardsWithUser, locals.supabase);
    return new Response(JSON.stringify(responseData), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
