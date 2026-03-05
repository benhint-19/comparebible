// ---------------------------------------------------------------------------
// POST /api/push/register -- store device push tokens in Firestore
// ---------------------------------------------------------------------------

import { getAdminFirestore } from "@/lib/push/firebaseAdmin";
import { CORS_HEADERS, corsOptions } from "../../cors";

export const runtime = "nodejs";

export { corsOptions as OPTIONS };

export async function POST(request: Request) {
  let body: {
    token?: string;
    platform?: string;
    timezone?: string;
    preferredHour?: number;
  };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400, headers: CORS_HEADERS });
  }

  const { token, platform, timezone, preferredHour } = body;
  if (!token || !platform) {
    return new Response("Missing required fields: token, platform", {
      status: 400, headers: CORS_HEADERS,
    });
  }

  try {
    const db = getAdminFirestore();
    const tokensRef = db.collection("device_tokens");

    // Upsert by token -- query for existing doc with this token
    const existing = await tokensRef.where("token", "==", token).limit(1).get();

    if (existing.empty) {
      await tokensRef.add({
        token,
        platform,
        timezone: timezone || "UTC",
        preferredHour: preferredHour ?? 8,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      });
    } else {
      // Update lastSeen timestamp and preferences
      const doc = existing.docs[0];
      await doc.ref.update({
        lastSeen: new Date().toISOString(),
        platform,
        ...(timezone !== undefined && { timezone }),
        ...(preferredHour !== undefined && { preferredHour }),
      });
    }

    return Response.json({ success: true }, { headers: CORS_HEADERS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[push/register] Error:", msg);
    return new Response(`Failed to register token: ${msg}`, { status: 500, headers: CORS_HEADERS });
  }
}
