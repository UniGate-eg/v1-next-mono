## 2026-10-16 - Prevent XSS in Zod URL validation
**Vulnerability:** Zod's `z.string().url()` allows protocols like `javascript:` and `data:`, which can lead to XSS vulnerabilities if the URL is later rendered in an `href` attribute.
**Learning:** `z.string().url()` only verifies if a string is a well-formed URL. It does not ensure the protocol is safe.
**Prevention:** Always chain a `.refine()` block to explicitly check for `http://` or `https://` schemas when using Zod URL validation, e.g. `z.string().url().refine((url) => /^https?:\/\//i.test(url))`.
