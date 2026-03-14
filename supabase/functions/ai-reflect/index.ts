import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { context, systemPrompt } = await req.json();

    const defaultSystem =
      "Du er en varm, ikke-dømmende støtteperson i en norsk CBT-app. " +
      "Svar alltid på norsk. Skriv 2–3 setninger. " +
      "Valider følelsen uten å analysere eller gi råd. " +
      "Bruk et enkelt, hverdagslig språk. Ikke bruk terapi-sjargong.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: systemPrompt || defaultSystem,
        messages: [{ role: "user", content: context }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API feil: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Kunne ikke hente refleksjon akkurat nå." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});