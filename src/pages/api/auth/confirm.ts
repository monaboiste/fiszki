import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import type { EmailOtpType } from "@supabase/supabase-js";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!tokenHash || !type) {
    return new Response(JSON.stringify({ error: "Missing required query parameters: token_hash and type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });
  console.log("user", data.user);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // return new Response(JSON.stringify({ user: data.user }), {
  //   status: 200,
  //   headers: { "Content-Type": "application/json" },
  // });
  return redirect("/");
};
