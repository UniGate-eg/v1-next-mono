## 2025-02-28 - Fix Open Redirect and XSS via URL Validation
**Vulnerability:** Open redirect bypasses due to incomplete relative-url validation, and potential XSS through z.string().url() allowing 'javascript:' protocol.
**Learning:** URL construction behavior in 'new URL' allows bypass of simple prefix string checks (e.g., using '/\t/' which resolves to external domains). Zod's '.url()' does not enforce standard HTTP/HTTPS schemes.
**Prevention:** Always validate relative URLs by checking their parsed origin against a baseline (e.g., a dummy origin like 'http://localhost'). Always explicitly constrain `.url()` validation in Zod with '.refine()' to ensure safe protocols.
