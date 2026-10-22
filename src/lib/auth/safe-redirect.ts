/**
 * Resolves and validates return redirects to prevent Open Redirect vulnerabilities (CWE-601).
 *
 * Security Rules:
 * 1. Must be a relative path starting with a single '/'
 * 2. Must not start with '//' or '/\\' (protocol-relative URLs)
 * 3. Must not contain control characters or dangerous schemes (javascript:, data:)
 *
 * @param target - The candidate redirect URL from searchParams or state
 * @param fallback - Safe default fallback path
 */
export function getSafeRedirectUrl(target: string | null | undefined, fallback = "/dashboard"): string {
  if (!target) return fallback;

  try {
    const base = "http://localhost";
    const parsed = new URL(target, base);
    if (parsed.origin !== base) {
      return fallback;
    }

    // Additional guard against pseudo-protocols masquerading as paths
    const combined = parsed.pathname + parsed.search + parsed.hash;
    if (
      combined.toLowerCase().includes("javascript:") ||
      combined.toLowerCase().includes("data:") ||
      combined.toLowerCase().includes("vbscript:")
    ) {
      return fallback;
    }
    return combined;
  } catch {
    return fallback;
  }
}
