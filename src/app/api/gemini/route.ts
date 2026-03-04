// ---------------------------------------------------------------------------
// POST /api/gemini -- streams an AI perspective for a Bible passage
// ---------------------------------------------------------------------------

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPersona } from "@/lib/ai/personas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("GEMINI_API_KEY is not configured", { status: 500 });
  }

  let body: { persona?: string; passage?: string; verseText?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { persona: personaId, passage, verseText } = body;
  if (!personaId || !passage || !verseText) {
    return new Response("Missing required fields: persona, passage, verseText", {
      status: 400,
    });
  }

  const persona = getPersona(personaId);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Passage: ${passage}\n\nText:\n${verseText}\n\nProvide your perspective on this passage.`;

  try {
    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: { role: "model", parts: [{ text: persona.systemPrompt }] },
    });

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            await writer.write(encoder.encode(text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream error";
        await writer.write(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Gemini API call failed: ${msg}`, { status: 502 });
  }
}
