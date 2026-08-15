# Interface Contract: Authentication & Client API (BetterAuth)

**Feature**: UniCompass Core University Guide Platform (`001-unicompass-core-platform`)  
**Type**: BetterAuth HTTP Handler & React Client API  

---

## 1. HTTP Endpoint Routing (`src/app/api/auth/[...all]/route.ts`)

BetterAuth automatically intercepts requests under `/api/auth/*`:

| Route | Method | Body Payload | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/sign-up/email` | `POST` | `{ name, email, password }` | Register new user account with argon2/bcrypt hash |
| `/api/auth/sign-in/email` | `POST` | `{ email, password }` | Authenticate user & issue HttpOnly session cookie |
| `/api/auth/sign-out` | `POST` | `{}` | Invalidate session & clear cookies |
| `/api/auth/get-session` | `GET` | — | Return active user session object or null |

---

## 2. Client-Side Browser API (`src/lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Client Methods:
- **`signUp.email({ name, email, password })`**: Registers user and transitions to authenticated state.
- **`signIn.email({ email, password })`**: Verifies credentials and sets session cookie.
- **`signOut()`**: Clears session and redirects to public route.
- **`useSession()`**: React hook providing `{ data: Session | null, isPending: boolean, error: Error | null }`.

---

## 3. Input Validation Schemas (`src/schemas/auth.schema.ts`)

```typescript
import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```
