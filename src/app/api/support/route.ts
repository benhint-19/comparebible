import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // Store in Firestore using admin SDK
    const { getAdminFirestore } = await import("@/lib/push/firebaseAdmin");
    const db = getAdminFirestore();
    await db.collection("support_messages").add({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Support] Failed to save message:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
