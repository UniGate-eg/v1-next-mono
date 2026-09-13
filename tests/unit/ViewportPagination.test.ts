import { describe, it, expect } from "vitest";
import { nextVisibleCount } from "../../src/hooks/useViewportPagination";

describe("nextVisibleCount", () => {
  it("adds a full page when far from the end", () => {
    expect(nextVisibleCount(0, 24, 100)).toBe(24);
    expect(nextVisibleCount(24, 24, 100)).toBe(48);
  });

  it("caps at total when the next page would overshoot", () => {
    expect(nextVisibleCount(90, 24, 100)).toBe(100);
  });

  it("handles a remainder smaller than a page", () => {
    expect(nextVisibleCount(20, 24, 30)).toBe(30);
  });

  it("stays put when already showing everything", () => {
    expect(nextVisibleCount(100, 24, 100)).toBe(100);
  });

  it("handles an empty list", () => {
    expect(nextVisibleCount(0, 24, 0)).toBe(0);
  });

  it("handles a page size larger than the total", () => {
    expect(nextVisibleCount(0, 50, 10)).toBe(10);
  });
});
