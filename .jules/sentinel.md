## 2024-05-24 - Prevent XSS in URL Validation
**Vulnerability:** Zod's `z.string().url()` allows arbitrary protocols like `javascript:`, which could lead to XSS vulnerabilities if these URLs are rendered directly into HTML `href` attributes.
**Learning:** Zod's built-in URL validation doesn't restrict to web-safe protocols. `javascript:alert(1)` is a valid URL according to the WHATWG specification that Zod implements.
**Prevention:** Always chain `.refine((val) => val.toLowerCase().startsWith('http://') || val.toLowerCase().startsWith('https://'))` when using `z.string().url()` for user-provided links that will be rendered.
