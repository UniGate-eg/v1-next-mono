## 2025-02-23 - Zod URL validation allows arbitrary schemes
**Vulnerability:** Zod's `z.string().url()` permits arbitrary protocols such as `javascript:`. If a user-provided URL is rendered directly into an `href` attribute without proper protocol validation, it can lead to XSS vulnerabilities.
**Learning:** We must explicitly enforce safe protocols (http/https) for URLs using `.refine()` to prevent XSS attacks in schemas that validate external URLs.
**Prevention:** Always chain `.refine((val) => val.toLowerCase().startsWith("http://") || val.toLowerCase().startsWith("https://"))` to `z.string().url()` when defining schema fields that will be rendered as URLs.
