## 2024-05-18 - XSS vulnerability in URL validation
**Vulnerability:** Zod's `z.string().url()` allows arbitrary protocols, including `javascript:`, leading to potential Cross-Site Scripting (XSS) when these URLs are rendered in `href` attributes.
**Learning:** Using `z.string().url()` without restricting the protocol can be dangerous.
**Prevention:** Always chain a `.refine()` block to explicitly enforce case-insensitive `http://` or `https://` prefixes (e.g., using `.toLowerCase().startsWith()`) when validating URLs. For schemas with modifiers like `.optional()` or `.or()`, ensure the `.refine()` block is chained before these modifiers.
