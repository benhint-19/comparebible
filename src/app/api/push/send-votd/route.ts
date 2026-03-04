// ---------------------------------------------------------------------------
// GET /api/push/send-votd -- Vercel Cron Job: send daily Verse of the Day push
// ---------------------------------------------------------------------------

import { getAdminFirestore, getAdminMessaging } from "@/lib/push/firebaseAdmin";
import { getVerseOfDay } from "@/lib/bible/verseOfDay";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[send-votd] CRON_SECRET env var is not configured");
    return new Response("Server misconfiguration", { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const votd = getVerseOfDay();
    const db = getAdminFirestore();
    const messaging = getAdminMessaging();

    const utcHour = new Date().getUTCHours();

    // Fetch all device tokens
    const snapshot = await db.collection("device_tokens").get();
    if (snapshot.empty) {
      return Response.json({ sent: 0, message: "No registered devices" });
    }

    const tokens: string[] = [];
    const docRefs: Map<string, FirebaseFirestore.DocumentReference> = new Map();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.token) return;

      // Determine the current local hour for this device's timezone
      const tz = data.timezone || "UTC";
      const preferredHour = data.preferredHour ?? 8;

      let localHour: number;
      try {
        // Use Intl to find the current hour in the device's timezone
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "numeric",
          hour12: false,
        });
        localHour = parseInt(formatter.format(new Date()), 10);
      } catch {
        // If timezone is invalid, fall back to UTC
        localHour = utcHour;
      }

      // Only include devices whose preferred hour matches the current local hour
      if (localHour === preferredHour) {
        tokens.push(data.token);
        docRefs.set(data.token, doc.ref);
      }
    });

    if (tokens.length === 0) {
      return Response.json({ sent: 0, message: "No valid tokens" });
    }

    // Send FCM notification in batch (up to 500 per call)
    const batchSize = 500;
    let totalSuccess = 0;
    let totalFailure = 0;
    const invalidTokens: string[] = [];

    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title: "Verse of the Day",
          body: votd.reference,
        },
        data: {
          bookId: votd.bookId,
          chapter: String(votd.chapter),
          verse: String(votd.verse),
        },
      });

      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      // Collect invalid tokens for cleanup
      response.responses.forEach((resp, idx) => {
        if (
          resp.error &&
          (resp.error.code === "messaging/invalid-registration-token" ||
            resp.error.code === "messaging/registration-token-not-registered")
        ) {
          invalidTokens.push(batch[idx]);
        }
      });
    }

    // Clean up invalid tokens from Firestore
    if (invalidTokens.length > 0) {
      const deletePromises = invalidTokens.map((token) => {
        const ref = docRefs.get(token);
        return ref ? ref.delete() : Promise.resolve();
      });
      await Promise.all(deletePromises);
      console.log(`[send-votd] Cleaned up ${invalidTokens.length} invalid tokens`);
    }

    return Response.json({
      sent: totalSuccess,
      failed: totalFailure,
      cleaned: invalidTokens.length,
      verse: votd.reference,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-votd] Error:", msg);
    return new Response(`Failed to send notifications: ${msg}`, { status: 500 });
  }
}
