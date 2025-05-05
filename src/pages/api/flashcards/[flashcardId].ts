import type { APIRoute } from "astro";
import { FlashcardsService, FlashcardNotFoundError } from "../../../lib/services/flashcards.service";
import { z } from "zod";

export const prerender = false;

const getFlashcardByIdSchema = z.object({
  flashcardId: z.string().regex(/^\d+$/, "Flashcard ID must be a number").transform(Number),
});

export const updateFlashcardByIdSchema = z.object({
  front: z.string().min(1, "Front must be at least 1 character").max(200, "Front must be at most 200 characters"),
  back: z.string().min(1, "Back must be at least 1 character").max(500, "Back must be at most 500 characters"),
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
          details: result.error.errors,
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

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const supabase = locals.supabase;
    const user = locals.user;

    const result = getFlashcardByIdSchema.safeParse(params);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid parameters",
          details: result.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const flashcardId = result.data.flashcardId;

    const body = await request.json();
    const validationResult = updateFlashcardByIdSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: validationResult.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { front, back } = validationResult.data;

    const flashcardsService = new FlashcardsService(supabase);
    const updatedFlashcard = await flashcardsService.updateFlashcard({
      user_id: user.id,
      flashcard_id: flashcardId,
      front,
      back,
    });

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof FlashcardNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error in PUT /flashcards/[flashcardId]:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Retrieve Supabase client and authenticated user
    const supabase = locals.supabase;
    const user = locals.user;

    // Validate and parse the flashcardId parameter
    const result = getFlashcardByIdSchema.safeParse(params);
    if (!result.success) {
      return new Response(JSON.stringify({ error: "Invalid parameters", details: result.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const flashcardId = result.data.flashcardId;

    // Perform deletion via service
    const flashcardsService = new FlashcardsService(supabase);
    await flashcardsService.deleteFlashcardById({ user_id: user.id, flashcard_id: flashcardId });

    // Success: no content
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof FlashcardNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Error in DELETE /flashcards/[flashcardId]:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
