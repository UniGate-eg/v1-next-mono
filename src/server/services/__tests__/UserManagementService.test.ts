import { describe, it, expect, vi } from "vitest";
import { UserManagementService } from "../UserManagementService";
import { UserContext } from "../../../types/rbac.types";

describe("UserManagementService Safeguards", () => {
  const actorSuperAdmin: UserContext = {
    id: "admin-1",
    email: "super@unigate.eg",
    name: "Super Admin",
    status: "ACTIVE",
    roles: [{ id: "r0", key: "SUPER_ADMIN", name: "Super Admin", hierarchyLevel: 0, isSystemDefault: true, description: null, createdAt: new Date(), updatedAt: new Date() }],
    permissions: new Set(["roles:manage", "users:manage_admins", "users:manage_staff"]),
    assignedUniversityIds: "GLOBAL",
    hierarchyLevel: 0,
  };

  const actorAdmin: UserContext = {
    id: "admin-2",
    email: "admin@unigate.eg",
    name: "Admin",
    status: "ACTIVE",
    roles: [{ id: "r10", key: "ADMIN", name: "Admin", hierarchyLevel: 10, isSystemDefault: true, description: null, createdAt: new Date(), updatedAt: new Date() }],
    permissions: new Set(["users:manage_staff"]),
    assignedUniversityIds: "GLOBAL",
    hierarchyLevel: 10,
  };

  it("prevents non-SuperAdmin from promoting a user to SuperAdmin (Hierarchy 0)", async () => {
    const mockUserRepo = { findAdminUserById: vi.fn().mockResolvedValue({ id: "target-user", roles: [] }) };
    const mockRoleRepo = { findById: vi.fn().mockResolvedValue({ id: "role-super", key: "SUPER_ADMIN", hierarchyLevel: 0 }) };
    const mockAssignmentRepo = { assignRole: vi.fn() };
    const mockAuditRepo = { create: vi.fn() };

    const service = new UserManagementService(mockUserRepo as any, mockRoleRepo as any, mockAssignmentRepo as any, mockAuditRepo as any);

    await expect(
      service.promoteUser(actorAdmin, { userId: "target-user", roleId: "role-super", universityIds: [] })
    ).rejects.toThrow(/Privilege violation|Super Administrators/);
  });

  it("blocks suspension of the sole active Super Administrator", async () => {
    const mockUserRepo = {
      findAdminUserById: vi.fn().mockResolvedValue({
        id: "sole-super",
        roles: [{ key: "SUPER_ADMIN", hierarchyLevel: 0 }],
      }),
      countActiveSuperAdmins: vi.fn().mockResolvedValue(1),
    };
    const mockRoleRepo = {};
    const mockAssignmentRepo = {};
    const mockAuditRepo = { create: vi.fn() };

    const service = new UserManagementService(mockUserRepo as any, mockRoleRepo as any, mockAssignmentRepo as any, mockAuditRepo as any);

    await expect(
      service.setUserStatus(actorSuperAdmin, { userId: "sole-super", status: "SUSPENDED" })
    ).rejects.toThrow(/Platform Lockout Safeguard/);
  });
});
