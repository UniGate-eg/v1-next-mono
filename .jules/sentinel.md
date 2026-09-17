## 2024-05-24 - [Medium] Fixed Information Exposure in Server Actions

**Vulnerability:** The admin authentication wrapper `withAdminAuth.ts` caught exceptions from administrative operations and returned the raw error message (`error.message`) in the `error` property of the JSON response sent to clients.

**Learning:** This exposes potential server-side internals, such as Prisma database query failures or stack trace details, which attackers can exploit to glean information about the schema and system architecture.

**Prevention:** Never expose raw error strings or exceptions to API responses directly. Catch errors on the server, log them securely, and return a sanitized, generic error message such as "An unexpected server error occurred".
