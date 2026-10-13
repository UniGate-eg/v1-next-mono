const { URL } = require('url');
function getSafeRedirectUrl(target, fallback = "/dashboard") {
  if (!target) return fallback;

  const trimmed = target.trim();

  try {
    // Parse as a URL relative to a trusted local origin
    const parsed = new URL(trimmed, "http://localhost");

    // Explicitly verify the origin hasn't been changed by malicious input
    // (e.g. malformed protocol-relative urls like /\t/example.com)
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }

    // Ensure the resulting path still starts with a slash
    if (!parsed.pathname.startsWith("/")) {
      return fallback;
    }

    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

console.log(getSafeRedirectUrl("///example.com"));
console.log(getSafeRedirectUrl("/\t/example.com"));
console.log(getSafeRedirectUrl("/\n/example.com"));
console.log(getSafeRedirectUrl("///example.com/test?param=1"));
console.log(getSafeRedirectUrl("/\\example.com"));
console.log(getSafeRedirectUrl("javascript:alert(1)"));
console.log(getSafeRedirectUrl("/dashboard?a=1#test"));
