"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const { API_BASE_URL } = await import("@/lib/apiBase");
      const res = await fetch(`${API_BASE_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm px-4 pt-[env(safe-area-inset-top)]">
        <Link
          href="/settings"
          className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">Support</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Have a question, found a bug, or want to request a feature? Send us a message and we&rsquo;ll get back to you.
        </p>

        {status === "sent" ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-2">
            <h2 className="font-medium text-green-700 dark:text-green-400">Message sent</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Thanks for reaching out. We&rsquo;ll get back to you as soon as we can.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or suggestion..."
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-500">
                Failed to send. You can also email us directly at{" "}
                <a href="mailto:twototangodev@gmail.com" className="underline">
                  twototangodev@gmail.com
                </a>
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}

        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            You can also reach us directly at{" "}
            <a href="mailto:twototangodev@gmail.com" className="text-[var(--color-accent)] hover:underline">
              twototangodev@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
