import { z } from "zod";

/**
 * Authoritative Login Validation Schema
 * Applied uniformly on client pre-flight and server processing.
 */
export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email address is required." })
    .trim()
    .min(1, "Email address is required.")
    .max(254, "Email address cannot exceed 254 characters.")
    .email("Please enter a valid email address (e.g. name@domain.com)."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required.")
    .max(128, "Password cannot exceed 128 characters."),
  rememberMe: z.boolean().default(true),
});

export const SignInSchema = LoginSchema;

export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNAUTHORIZED";

export interface AuthResponse {
  success: boolean;
  redirectTo?: string;
  errorCode?: AuthErrorCode;
  errorMessage?: string;
  retryAfterSeconds?: number;
}

