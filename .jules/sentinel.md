## 2024-10-24 - Open Redirect via Malformed Path
**Vulnerability:** Open redirect vulnerability due to relying on simple prefix checks (`startsWith('//')`) which allows malformed paths like `/\t/example.com` to be parsed as external URLs by the `URL` constructor.
**Learning:** The `URL` constructor normalizes malformed inputs and can extract an external domain even if it passes basic string checks.
**Prevention:** Always validate the parsed URL's `origin` against the expected safe origin instead of relying purely on string prefix checks.
