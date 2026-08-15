import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    ACCELERATE_URL: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().min(16).default("unicompass_development_secret_key_32bytes_minimum!"),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    ACCELERATE_URL: process.env.ACCELERATE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
