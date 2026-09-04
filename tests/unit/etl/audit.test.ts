/**
 * @file audit.test.ts
 * @description Unit tests for PostIngestionAudit — post-ingestion referential
 * integrity checks and orphan FK detection.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostIngestionAudit, AuditReport } from "../../../src/server/etl/PostIngestionAudit";

// ─────────────────────────────────────────────────────────────────────────────
// Prisma mock factory
// ─────────────────────────────────────────────────────────────────────────────

function makePrismaMock(overrides: {
  universityCount?: number;
  facultyCount?: number;
  degreeProgramCount?: number;
  universities?: { id: string }[];
  programs?: { id: string; universityId: string; facultyId: string | null }[];
}) {
  const {
    universityCount = 43,
    facultyCount = 381,
    degreeProgramCount = 1448,
    universities = Array.from({ length: 43 }, (_, i) => ({ id: `uni-${i}` })),
    programs = [],
  } = overrides;

  return {
    university: {
      count: vi.fn().mockResolvedValue(universityCount),
      findMany: vi.fn().mockResolvedValue(universities),
    },
    faculty: {
      count: vi.fn().mockResolvedValue(facultyCount),
    },
    degreeProgram: {
      count: vi.fn().mockResolvedValue(degreeProgramCount),
      findMany: vi.fn().mockResolvedValue(programs),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("PostIngestionAudit", () => {
  describe("runAudit() — passing scenarios", () => {
    it("passes when counts are exactly 43 / 381 / 1448 with zero orphan programs", async () => {
      const prisma = makePrismaMock({
        // Programs whose universityId matches one of the 43 mock unis
        programs: Array.from({ length: 5 }, (_, i) => ({
          id: `prog-${i}`,
          universityId: `uni-${i % 43}`,
          facultyId: null,
        })),
      });

      const auditor = new PostIngestionAudit(prisma as never);
      const report: AuditReport = await auditor.runAudit();

      expect(report.passed).toBe(true);
      expect(report.universitiesCount).toBe(43);
      expect(report.facultiesCount).toBe(381);
      expect(report.programsCount).toBe(1448);
      expect(report.orphanPrograms).toBe(0);
      expect(report.errors).toHaveLength(0);
    });
  });

  describe("runAudit() — failing scenarios", () => {
    it("fails when university count is wrong", async () => {
      const prisma = makePrismaMock({ universityCount: 40, universities: Array.from({ length: 40 }, (_, i) => ({ id: `uni-${i}` })) });
      const auditor = new PostIngestionAudit(prisma as never);
      const report = await auditor.runAudit();

      expect(report.passed).toBe(false);
      expect(report.errors.some((e) => e.includes("40"))).toBe(true);
    });

    it("fails when faculty count is wrong", async () => {
      const prisma = makePrismaMock({ facultyCount: 300 });
      const auditor = new PostIngestionAudit(prisma as never);
      const report = await auditor.runAudit();

      expect(report.passed).toBe(false);
      expect(report.errors.some((e) => e.includes("300"))).toBe(true);
    });

    it("fails when degree program count is wrong", async () => {
      const prisma = makePrismaMock({ degreeProgramCount: 999 });
      const auditor = new PostIngestionAudit(prisma as never);
      const report = await auditor.runAudit();

      expect(report.passed).toBe(false);
      expect(report.errors.some((e) => e.includes("999"))).toBe(true);
    });

    it("detects orphan programs referencing non-existent universities", async () => {
      const universities = Array.from({ length: 43 }, (_, i) => ({ id: `uni-${i}` }));
      const programs = [
        { id: "prog-valid", universityId: "uni-0", facultyId: null },
        { id: "prog-orphan", universityId: "uni-GHOST", facultyId: null }, // orphan
      ];

      const prisma = makePrismaMock({ universities, programs });
      const auditor = new PostIngestionAudit(prisma as never);
      const report = await auditor.runAudit();

      // Count may still pass (mocked to 1448) but orphan should be detected
      expect(report.orphanPrograms).toBe(1);
      // Passed depends on count mocks — orphan check adds to errors
      expect(report.errors.some((e) => e.toLowerCase().includes("orphan") || e.toLowerCase().includes("non-existent"))).toBe(true);
    });

    it("accumulates multiple errors when several counts are wrong", async () => {
      const prisma = makePrismaMock({
        universityCount: 10,
        facultyCount: 20,
        degreeProgramCount: 30,
        universities: Array.from({ length: 10 }, (_, i) => ({ id: `uni-${i}` })),
      });

      const auditor = new PostIngestionAudit(prisma as never);
      const report = await auditor.runAudit();

      expect(report.passed).toBe(false);
      expect(report.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("runAudit() — AuditReport shape", () => {
    it("returns a well-formed AuditReport with all required fields", async () => {
      const prisma = makePrismaMock({});
      const auditor = new PostIngestionAudit(prisma as never);
      const report = await auditor.runAudit();

      expect(report).toHaveProperty("passed");
      expect(report).toHaveProperty("universitiesCount");
      expect(report).toHaveProperty("facultiesCount");
      expect(report).toHaveProperty("programsCount");
      expect(report).toHaveProperty("orphanFaculties");
      expect(report).toHaveProperty("orphanPrograms");
      expect(report).toHaveProperty("errors");
      expect(Array.isArray(report.errors)).toBe(true);
    });
  });
});
