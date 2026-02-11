export default async (req) => {
  // Basic CORS (safe for browser calls)
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers: cors });
  }

  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY in Netlify env vars" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Call OpenAI Responses API (recommended)
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: messages, // array of {role, content}
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || "OpenAI error" }), {
        status: r.status,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Pull text out of the response
    const reply =
      (data.output_text ?? "").trim() ||
      "No reply returned.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error: " + (err?.message || err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
};
