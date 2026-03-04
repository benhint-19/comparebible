"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm px-4">
        <Link
          href="/settings"
          className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">Privacy Policy</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6 text-sm text-[var(--color-foreground)] leading-relaxed">
        <p className="text-[var(--color-muted-foreground)]">Effective date: March 4, 2026</p>

        <p>
          Selah (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;the app&rdquo;) is a Bible study application.
          This policy explains what data we collect, why, and how we handle it.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">1. Data we collect</h2>

          <h3 className="font-medium">Account information (optional)</h3>
          <p>
            If you choose to sign in, we store your email address, display name, and a unique user ID
            through Firebase Authentication. You may also sign in with Google or Apple, in which case
            we receive only the information those providers share (typically email and name).
            You can use Selah without creating an account.
          </p>

          <h3 className="font-medium">Synced preferences and content</h3>
          <p>
            When signed in, we store the following in Google Cloud Firestore so you can access it across devices:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Reading position (current book and chapter)</li>
            <li>App settings (font size, notification preferences, selected translations and AI perspectives)</li>
            <li>Personal verse notes you create</li>
          </ul>

          <h3 className="font-medium">Push notification tokens</h3>
          <p>
            If you enable daily verse notifications, we store your device push token, platform,
            timezone, and preferred delivery time. This data is used solely to send you the
            notification you requested.
          </p>

          <h3 className="font-medium">Local data</h3>
          <p>
            Bible chapter text is cached in your browser&rsquo;s IndexedDB for offline access.
            Your settings are also stored in localStorage. This data never leaves your device
            unless you sign in and enable sync.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">2. Data we do NOT collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not use analytics, tracking pixels, or advertising SDKs.</li>
            <li>We do not sell, rent, or share your personal data with third parties.</li>
            <li>We do not track which verses you read or how you use the app.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">3. Third-party services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Firebase</strong> (Google) &mdash; authentication, cloud storage, and push notifications.
              See <a href="https://firebase.google.com/support/privacy" className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener noreferrer">Firebase Privacy Policy</a>.
            </li>
            <li>
              <strong>Google Gemini API</strong> &mdash; when you request AI analysis of a passage,
              the verse text is sent to Google&rsquo;s Gemini API to generate the response.
              We do not send any personal data with these requests.
              See <a href="https://ai.google.dev/terms" className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener noreferrer">Google AI Terms</a>.
            </li>
            <li>
              <strong>bible.helloao.org</strong> &mdash; Bible text is fetched from this public API.
              No personal data is sent with these requests.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">4. Data retention and deletion</h2>
          <p>
            Your synced data is retained as long as your account exists. You can delete your account
            and all associated data by contacting us at the email below. Local data (IndexedDB and
            localStorage) can be cleared through your browser settings at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">5. Children&rsquo;s privacy</h2>
          <p>
            Selah does not knowingly collect personal information from children under 13.
            The app is suitable for all ages, but account creation is not intended for children
            under 13 without parental consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">6. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Changes will be reflected on this page
            with an updated effective date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">7. Contact</h2>
          <p>
            Questions or requests regarding your data? Email us at{" "}
            <a href="mailto:twototangodev@gmail.com" className="text-[var(--color-accent)] hover:underline">
              twototangodev@gmail.com
            </a>.
          </p>
        </section>
      </main>
    </div>
  );
}
