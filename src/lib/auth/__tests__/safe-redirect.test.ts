import { describe, it, expect } from "vitest";
import { getSafeRedirectUrl } from "../safe-redirect";

describe("getSafeRedirectUrl", () => {
  it("should return the default fallback if no target is provided", () => {
    expect(getSafeRedirectUrl(null)).toBe("/dashboard");
    expect(getSafeRedirectUrl(undefined)).toBe("/dashboard");
    expect(getSafeRedirectUrl("")).toBe("/dashboard");
  });

  it("should return the fallback if target does not start with '/'", () => {
    expect(getSafeRedirectUrl("https://example.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("example.com")).toBe("/dashboard");
  });

  it("should return the fallback for protocol-relative paths", () => {
    expect(getSafeRedirectUrl("//example.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/\\example.com")).toBe("/dashboard");
  });

  it("should prevent open redirects with control characters", () => {
    // Tests the fix where `new URL` parses malformed URLs to different origins
    expect(getSafeRedirectUrl("/\t//example.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/\n//example.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/\r//example.com")).toBe("/dashboard");
  });

  it("should prevent dangerous schemes", () => {
    expect(getSafeRedirectUrl("/javascript:alert(1)")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/data:text/html,<body>")).toBe("/dashboard");
  });

  it("should allow valid relative paths", () => {
    expect(getSafeRedirectUrl("/profile")).toBe("/profile");
    expect(getSafeRedirectUrl("/settings/security")).toBe("/settings/security");
    expect(getSafeRedirectUrl("/dashboard?a=1&b=2")).toBe("/dashboard?a=1&b=2");
    expect(getSafeRedirectUrl("/dashboard#section")).toBe("/dashboard#section");
  });

  it("should respect a custom fallback", () => {
    expect(getSafeRedirectUrl("//evil.com", "/custom")).toBe("/custom");
    expect(getSafeRedirectUrl("/\t//evil.com", "/custom")).toBe("/custom");
  });
});
