## 2024-10-18 - URL Validation using Zod
**Vulnerability:** The schemas `src/schemas/suggestion.schema.ts` and `src/schemas/university.schema.ts` use `z.string().url()` to validate user-provided URLs. `z.string().url()` allows arbitrary schemes such as `javascript:`, which can lead to Cross-Site Scripting (XSS) when rendered in `href` attributes.
**Learning:** `z.string().url()` only checks for a valid URL format but does not restrict the scheme. It must be explicitly refined or configured to only allow `http` and `https`.
**Prevention:** Always chain `.refine()` to explicitly enforce `http://` or `https://` prefixes for URL validations.
