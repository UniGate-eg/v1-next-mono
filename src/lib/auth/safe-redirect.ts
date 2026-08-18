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

  const trimmed = target.trim();

  // Guard against protocol-relative URLs and non-relative paths
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Guard against dangerous schemes encoded in path format
  if (
    trimmed.toLowerCase().includes("javascript:") ||
    trimmed.toLowerCase().includes("data:") ||
    trimmed.toLowerCase().includes("vbscript:")
  ) {
    return fallback;
  }

  try {
    // Verify that parsing as a relative URL inside a dummy origin maintains the exact pathname
    const parsed = new URL(trimmed, "http://localhost");
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
