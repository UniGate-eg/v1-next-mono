## 2024-10-24 - [Zod URL Validation XSS Risk]
**Vulnerability:** Zod's `z.string().url()` allows arbitrary protocols, including `javascript:`, which can lead to XSS vulnerabilities when the URL is rendered in `href` attributes.
**Learning:** Default URL validation in schema libraries may not restrict protocols to safe HTTP/HTTPS schemes, allowing dangerous inputs to pass validation.
**Prevention:** Always explicitly enforce safe protocols (e.g., using `.refine()` in Zod) when validating URLs that may be rendered in the browser.
