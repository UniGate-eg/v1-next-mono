## 2024-05-24 - Fix XSS vulnerability in Zod URL validation
**Vulnerability:** Zod's `url()` validation allows arbitrary protocols, including `javascript:`, which can lead to XSS if rendered in an `href` attribute.
**Learning:** Relying solely on `z.string().url()` without protocol restriction is unsafe for user-provided URLs that might be rendered in the UI.
**Prevention:** Always chain `.refine()` to explicitly enforce case-insensitive `http://` or `https://` prefixes (e.g., using `.toLowerCase().startsWith()`) when validating URLs in Zod schemas.
