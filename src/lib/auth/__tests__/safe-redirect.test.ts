import { describe, expect, it } from "vitest";
import { getSafeRedirectUrl } from "../safe-redirect";

describe("getSafeRedirectUrl", () => {
  it("should return fallback for missing or empty target", () => {
    expect(getSafeRedirectUrl(null)).toBe("/dashboard");
    expect(getSafeRedirectUrl("")).toBe("/dashboard");
  });

  it("should return valid relative URL", () => {
    expect(getSafeRedirectUrl("/profile")).toBe("/profile");
    expect(getSafeRedirectUrl("/settings?tab=general")).toBe("/settings?tab=general");
    expect(getSafeRedirectUrl("/docs#section1")).toBe("/docs#section1");
  });

  it("should fallback on absolute URLs", () => {
    expect(getSafeRedirectUrl("https://evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("http://evil.com")).toBe("/dashboard");
  });

  it("should fallback on protocol-relative URLs", () => {
    expect(getSafeRedirectUrl("//evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/\\evil.com")).toBe("/dashboard");
  });

  it("should guard against bypasses with control characters", () => {
    expect(getSafeRedirectUrl("/\t/evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/\n/evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("/\r/evil.com")).toBe("/dashboard");
  });
});
