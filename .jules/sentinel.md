## 2025-02-13 - [URL Schema XSS Vulnerability]
**Vulnerability:** Zod `z.string().url()` allows non-HTTP schemas like `javascript:`, which can lead to XSS if rendered in `href` attributes (e.g. university websites or suggestion source URLs).
**Learning:** Default URL validation in Zod does not restrict the protocol to `http` or `https`, which is a common pitfall that exposes applications to XSS attacks via javascript URIs.
**Prevention:** Always use a custom refinement or explicit protocol checking when accepting URLs from user input that will be rendered as links.
