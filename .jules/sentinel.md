## 2024-03-01 - URL Scheme Validation XSS Prevention
**Vulnerability:** Zod's `z.string().url()` allows arbitrary URI schemes including `javascript:`, which can lead to XSS vulnerabilities if rendered in `href` attributes.
**Learning:** Default URL validators often only check structural validity, not semantic safety of the scheme.
**Prevention:** Always chain `.refine()` to explicitly enforce `http://` or `https://` prefixes for user-submitted URLs.
