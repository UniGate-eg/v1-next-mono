## 2024-10-23 - Prevent XSS in URL validations
**Vulnerability:** The Zod schemas `CreateSuggestionSchema` (`sourceUrl`) and `CreateUniversitySchema` (`website`) used `z.string().url()` for validation. Zod's `url()` validation allows arbitrary protocols, including `javascript:`, `data:`, and `vbscript:`. If these URLs are later rendered unescaped into `href` attributes, they can lead to Stored Cross-Site Scripting (XSS).
**Learning:** `z.string().url()` is insufficient for safely validating URLs intended to be rendered as links in the DOM.
**Prevention:** Always restrict accepted protocols to `http://` or `https://` using a `.refine` check when validating URLs intended to be used as web links.
