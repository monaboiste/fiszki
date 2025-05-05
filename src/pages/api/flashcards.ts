export const prerender = false;

import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardsService } from "../../lib/services/flashcards.service";

// Input validation schema
const postFlashcardsSchema = z.object({
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

const getFlashcardsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["created_at", "updated_at"]).default("created_at"),
  filter: z.array(z.string()).optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = postFlashcardsSchema.safeParse(body);
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

    // Insert flashcards using the service
    const { flashcards } = validationResult.data;
    const flashcardsWithUser = flashcards.map((flashcard) => ({ ...flashcard, user_id: user.id }));

    const flashcardsService = new FlashcardsService(supabase);
    const responseData = await flashcardsService.createFlashcards(flashcardsWithUser);

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

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    // Parse and validate query parameters
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams);
    const result = getFlashcardsSchema.safeParse(searchParams);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid parameters",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get flashcards using the service
    const flashcardsService = new FlashcardsService(supabase);
    const response = await flashcardsService.getFlashcards({
      user_id: user.id,
      ...result.data,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /flashcards:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
