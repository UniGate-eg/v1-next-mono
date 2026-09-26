## 2026-09-26 - Fix Stored XSS via javascript: URLs in Zod Validation
**Vulnerability:** Zod's `.url()` validator permits dangerous URI schemes like `javascript:` and `data:` which leads to Stored XSS if the input is rendered as a link in the UI without protocol-level validation.
**Learning:** You must not rely solely on `z.string().url()` for security-critical URL fields. This codebase's data was directly rendered into `href` attributes in Admin Dashboards, allowing XSS.
**Prevention:** Extend Zod schemas using `.refine()` to explicitly mandate `http:` or `https:` protocols before accepting URL inputs.
