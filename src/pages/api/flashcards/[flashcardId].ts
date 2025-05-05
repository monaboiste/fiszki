import type { APIRoute } from "astro";
import { FlashcardsService, FlashcardNotFoundError } from "../../../lib/services/flashcards.service";
import { z } from "zod";

export const prerender = false;

const getFlashcardByIdSchema = z.object({
  flashcardId: z.string().regex(/^\d+$/, "Flashcard ID must be a number").transform(Number),
});

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;
    const result = getFlashcardByIdSchema.safeParse(params);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid parameters",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const flashcardsService = new FlashcardsService(supabase);
    const flashcard = await flashcardsService.getFlashcardById({
      user_id: user.id,
      flashcard_id: result.data.flashcardId,
    });

    return new Response(JSON.stringify(flashcard), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof FlashcardNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error in GET /flashcards/[flashcardId]:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
