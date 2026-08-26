import { describe, it, expect, vi } from "vitest";
import { RbacService } from "../RbacService";

describe("RbacService", () => {
  it("denies permission if user account is suspended", async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ status: "SUSPENDED" }),
      },
      userRoleAssignment: {
        findMany: vi.fn(),
      },
    };

    const service = new RbacService(mockPrisma as any);
    const permitted = await service.hasPermission("user-1", "content:publish");
    expect(permitted).toBe(false);
  });

  it("grants permission when user has active global role assignment", async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ status: "ACTIVE" }),
      },
      userRoleAssignment: {
        findMany: vi.fn().mockResolvedValue([
          {
            role: { key: "ADMIN" },
            institutionAssignments: [], // empty = GLOBAL
          },
        ]),
      },
    };

    const service = new RbacService(mockPrisma as any);
    const permitted = await service.hasPermission("user-1", "universities:create_delete", "cu-id");
    expect(permitted).toBe(true);
  });

  it("enforces institution scope for scoped roles", async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ status: "ACTIVE" }),
      },
      userRoleAssignment: {
        findMany: vi.fn().mockResolvedValue([
          {
            role: { key: "UNIVERSITY_REP" },
            institutionAssignments: [{ universityId: "cairo-univ" }],
          },
        ]),
      },
    };

    const service = new RbacService(mockPrisma as any);
    // Cairo Univ -> allowed
    const allowed = await service.hasPermission("user-1", "universities:edit_scoped", "cairo-univ");
    expect(allowed).toBe(true);

    // AUC -> denied
    const denied = await service.hasPermission("user-1", "universities:edit_scoped", "auc-univ");
    expect(denied).toBe(false);
  });
});
