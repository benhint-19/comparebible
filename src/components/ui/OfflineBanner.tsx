"use client";

import { useOfflineDetection } from "@/hooks/useOfflineDetection";

export default function OfflineBanner() {
  const { isOnline } = useOfflineDetection();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="w-full bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-800"
    >
      You&apos;re offline &mdash; cached content is still available
    </div>
  );
}
