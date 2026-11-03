## 2024-05-24 - Fix Zod URL Validation XSS Vulnerability
**Vulnerability:** Zod's `z.string().url()` allows arbitrary protocols like `javascript:`, which could lead to Stored XSS if these URLs are rendered into `href` attributes (e.g. `website` or `sourceUrl`).
**Learning:** `z.string().url()` validates only that a string is *a* URL, not a *safe* URL. It accepts things like `javascript:alert(1)`.
**Prevention:** Always chain `.refine()` to enforce safe protocols (e.g., `http://` or `https://`) for user-provided URLs that might be rendered as links. Ensure that the refinement is applied *before* `.optional()` or `.or()`.
