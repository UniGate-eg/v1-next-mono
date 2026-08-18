import { describe, it, expect } from "vitest";
import { getSafeRedirectUrl } from "@/lib/auth/safe-redirect";
import { mapAuthErrorToMessage } from "@/lib/auth/error-mapper";
import { LoginSchema } from "@/schemas/auth.schema";

describe("Authentication Security: Open-Redirect Defense (getSafeRedirectUrl)", () => {
  it("allows standard internal relative paths", () => {
    expect(getSafeRedirectUrl("/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/dashboard/settings")).toBe("/dashboard/settings");
    expect(getSafeRedirectUrl("/universities?city=Cairo&sort=asc#majors")).toBe(
      "/universities?city=Cairo&sort=asc#majors"
    );
  });

  it("blocks protocol-relative URLs (e.g. //evil.com)", () => {
    expect(getSafeRedirectUrl("//evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("//evil.com/login")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/\\evil.com")).toBe("/dashboard");
  });

  it("blocks external absolute URLs (e.g. https://phishing-site.com)", () => {
    expect(getSafeRedirectUrl("https://phishing-site.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("http://phishing-site.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("ftp://files.com")).toBe("/dashboard");
  });

  it("blocks javascript: and data: pseudo-protocol URLs", () => {
    expect(getSafeRedirectUrl("javascript:alert(1)")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/javascript:alert(1)")).toBe("/dashboard");
    expect(getSafeRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe("/dashboard");
  });

  it("uses custom fallback when specified and target is empty or invalid", () => {
    expect(getSafeRedirectUrl("", "/admin")).toBe("/admin");
    expect(getSafeRedirectUrl(null, "/admin/dashboard")).toBe("/admin/dashboard");
    expect(getSafeRedirectUrl(undefined, "/profile")).toBe("/profile");
    expect(getSafeRedirectUrl("//evil.com", "/profile")).toBe("/profile");
  });
});

describe("Authentication Validation: LoginSchema", () => {
  it("validates correct credentials successfully", () => {
    const result = LoginSchema.safeParse({
      email: "student@unigate.eg",
      password: "ValidPassword123!",
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it("fails when email is improperly formatted", () => {
    const result = LoginSchema.safeParse({
      email: "not-an-email",
      password: "ValidPassword123!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("valid email address");
    }
  });

  it("fails when password is empty", () => {
    const result = LoginSchema.safeParse({
      email: "student@unigate.eg",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("Password is required");
    }
  });

  it("fails when input exceeds maximum bounds to prevent payload injection", () => {
    const longEmail = `${"a".repeat(250)}@test.com`;
    const result = LoginSchema.safeParse({
      email: longEmail,
      password: "p",
    });
    expect(result.success).toBe(false);
  });
});

describe("Authentication Error Sanitization: mapAuthErrorToMessage", () => {
  it("returns uniform non-revealing credential error in English", () => {
    const msg = mapAuthErrorToMessage("INVALID_CREDENTIALS", undefined, "en");
    expect(msg).toBe("Incorrect email or password. Please verify your details and try again.");
  });

  it("returns calm rate-limit message in English", () => {
    const msg = mapAuthErrorToMessage("RATE_LIMITED", undefined, "en");
    expect(msg).toContain("Too many sign-in attempts");
  });

  it("returns localized messages in Arabic", () => {
    const msg = mapAuthErrorToMessage("INVALID_CREDENTIALS", undefined, "ar");
    expect(msg).toContain("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  });
});
