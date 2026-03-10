// ---------------------------------------------------------------------------
// POST /api/tts -- synthesizes speech audio via Edge TTS
// ---------------------------------------------------------------------------

import { EdgeTTS } from "edge-tts-universal";
import { getVoiceById, TTS_VOICES } from "@/lib/tts/voices";

export const runtime = "nodejs";

import { CORS_HEADERS, corsOptions } from "../cors";

export { corsOptions as OPTIONS };

export async function POST(request: Request) {
  let body: { text?: string; voice?: string; rate?: number };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const { text, voice: voiceId, rate = 1 } = body;

  if (!text || typeof text !== "string") {
    return new Response("Missing required field: text", {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  // Cap text length to prevent abuse
  if (text.length > 2000) {
    return new Response("Text too long (max 2000 chars)", {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const voice = voiceId ? getVoiceById(voiceId) : TTS_VOICES[0];
  if (!voice) {
    return new Response(
      `Unknown voice: ${voiceId}. Available: ${TTS_VOICES.map((v) => v.id).join(", ")}`,
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // Convert numeric rate (0.75-1.5) to Edge TTS percentage string
  const ratePercent = Math.round((rate - 1) * 100);
  const rateStr = `${ratePercent >= 0 ? "+" : ""}${ratePercent}%`;

  try {
    const tts = new EdgeTTS(text, voice.edgeVoice, { rate: rateStr });
    const result = await tts.synthesize();
    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

    return new Response(audioBuffer, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.length),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[TTS] Edge TTS error:", msg);
    return new Response(`TTS synthesis failed: ${msg}`, {
      status: 502,
      headers: CORS_HEADERS,
    });
  }
}
