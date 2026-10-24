## 2024-05-24 - Zod URL Validation XSS Risk
**Vulnerability:** Zod's `z.string().url()` allows arbitrary protocols like `javascript:`, which could lead to XSS if rendered in `href` attributes.
**Learning:** We must always restrict URLs to explicitly safe protocols (`http`, `https`) when validating user input that might be rendered as a link.
**Prevention:** Use `.refine(url => url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://'))` on user-submitted URL schemas.
