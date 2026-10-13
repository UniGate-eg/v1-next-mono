const { URL } = require('url');

function getSafeRedirectUrl(target, fallback = "/dashboard") {
  if (!target) return fallback;

  const trimmed = target.trim();

  try {
    // We want the parsed URL to originate from localhost
    const parsed = new URL(trimmed, "http://localhost");

    // Check if the resulting origin is the one we provided
    if (parsed.origin !== "http://localhost") {
       return fallback;
    }

    // Ensure it's a relative path by checking if the pathname starts with '/'
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
console.log(getSafeRedirectUrl("/\\example.com"));
console.log(getSafeRedirectUrl("/dashboard?a=1#test"));
console.log(getSafeRedirectUrl("javascript:alert(1)"));
console.log(getSafeRedirectUrl("https://google.com"));
