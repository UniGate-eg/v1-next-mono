## 2024-05-24 - Zod URL Validation Protocol Bypass
**Vulnerability:** Zod's `z.string().url()` allows arbitrary protocols like `javascript:`, which can lead to XSS if the URL is used in an `href` attribute.
**Learning:** We must explicitly restrict URL schemas in Zod to known safe protocols (http/https) to avoid malicious URI injection.
**Prevention:** Always chain `.refine((val) => val.toLowerCase().startsWith('http://') || val.toLowerCase().startsWith('https://'))` before `.optional()` or `.or()` modifiers when validating URLs.
