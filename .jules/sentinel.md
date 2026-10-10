
## 2024-10-10 - Open Redirect via Malformed URL Parsing Bypass
**Vulnerability:** Open Redirect vulnerability in `getSafeRedirectUrl` due to reliance on string prefix checks (`startsWith`) which failed to handle malformed protocol-relative paths containing control characters (e.g., `/\t//example.com`). The `URL` constructor parsed these into valid absolute URLs, bypassing the safeguard.
**Learning:** When validating relative redirect URLs to prevent Open Redirect vulnerabilities, string prefix checks are insufficient because the `URL` constructor parses malformed paths as external domains.
**Prevention:** Always validate the parsed URL's `origin` against the expected safe origin (e.g., a dummy origin like `http://localhost`) after using the URL constructor.
