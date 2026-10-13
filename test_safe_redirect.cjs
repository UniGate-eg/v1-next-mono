const { URL } = require('url');

function getSafeRedirectUrl(target, fallback = "/dashboard") {
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

console.log(getSafeRedirectUrl("///example.com"));
console.log(getSafeRedirectUrl("/\t/example.com"));
console.log(getSafeRedirectUrl("/\\example.com"));
