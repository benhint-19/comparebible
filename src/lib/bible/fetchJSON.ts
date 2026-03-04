// ---------------------------------------------------------------------------
// Safe JSON fetch helper — guards against HTML error pages from CDNs/proxies
// ---------------------------------------------------------------------------
//
// Some servers (Cloudflare, Bolls.life, etc.) may return a 200 OK with an
// HTML body for captchas, soft-404s, or rate-limit pages.  Calling .json()
// on such a response produces the confusing:
//   "Unexpected token '<', '<!doctype'... is not valid JSON"
//
// This helper centralises the check so every Bible API call is protected.
// ---------------------------------------------------------------------------

/**
 * Fetch a URL and parse the response as JSON.
 *
 * Throws a descriptive error if:
 *  - the response status is not 2xx, OR
 *  - the response body is not valid JSON (e.g. an HTML error page).
 */
export async function fetchJSON<T = unknown>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);

  if (!res.ok) {
    throw new Error(
      `Fetch failed: ${res.status} ${res.statusText} — ${url}`,
    );
  }

  // Guard against HTML responses masquerading as 200 OK.
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    throw new Error(
      `Expected JSON but received HTML from ${url} (status ${res.status}). ` +
        "The server may be returning an error page.",
    );
  }

  // Even with the content-type check, wrap .json() in a try/catch for
  // edge cases (missing content-type header, truncated responses, etc.).
  try {
    return (await res.json()) as T;
  } catch (parseError) {
    throw new Error(
      `Invalid JSON response from ${url} (status ${res.status}): ${
        parseError instanceof Error ? parseError.message : String(parseError)
      }`,
    );
  }
}
