import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_ROLES = [
  { key: "SUPER_ADMIN", name: "Super Admin", description: "Platform Owner & Engineering Lead with full system authority", hierarchyLevel: 0, isSystemDefault: true },
  { key: "ADMIN", name: "Platform Admin", description: "Operations & Data Lead with global catalog, staff management, and rollback authority", hierarchyLevel: 10, isSystemDefault: true },
  { key: "CONTENT_EDITOR", name: "Content Editor", description: "In-house content editor with global catalog edit and publish capabilities", hierarchyLevel: 20, isSystemDefault: true },
  { key: "UNIVERSITY_REP", name: "University Representative", description: "University admissions & faculty representative scoped to assigned institutions", hierarchyLevel: 30, isSystemDefault: true },
  { key: "COMMUNITY_MODERATOR", name: "Community Moderator", description: "Trust & safety moderator with suggestion queue review authority", hierarchyLevel: 40, isSystemDefault: true },
  { key: "STUDENT", name: "Student", description: "Baseline registered user", hierarchyLevel: 100, isSystemDefault: true },
];

const DEFAULT_PERMISSIONS = [
  { code: "roles:manage", domain: "roles", action: "manage", description: "Create, customize, and delete dynamic roles and permissions" },
  { code: "users:manage_admins", domain: "users", action: "manage_admins", description: "Promote, demote, or suspend Admin accounts" },
  { code: "users:manage_staff", domain: "users", action: "manage_staff", description: "Promote registered users to Editor, Rep, Moderator" },
  { code: "universities:create_delete", domain: "universities", action: "create_delete", description: "Create new universities or delete existing ones" },
  { code: "universities:edit_global", domain: "universities", action: "edit_global", description: "Edit any university profile and tuition platform-wide" },
  { code: "universities:edit_scoped", domain: "universities", action: "edit_scoped", description: "Edit university data within assigned institution scope" },
  { code: "content:draft", domain: "content", action: "draft", description: "Create and edit draft changes without publishing live" },
  { code: "content:publish", domain: "content", action: "publish", description: "Push data live with automatic ISR cache invalidation" },
  { code: "data:rollback", domain: "data", action: "rollback", description: "Execute atomic state reversion from audit snapshot" },
  { code: "data:bulk_mutate", domain: "data", action: "bulk_mutate", description: "Perform batch publish and archive operations" },
  { code: "moderation:review", domain: "moderation", action: "review", description: "Review, approve, and reject community suggestions" },
  { code: "audit:view", domain: "audit", action: "view", description: "View and filter immutable system mutation logs" },
  { code: "data:export_snapshot", domain: "data", action: "export_snapshot", description: "Export complete database JSON snapshots" },
];

const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  SUPER_ADMIN: [
    "roles:manage", "users:manage_admins", "users:manage_staff",
    "universities:create_delete", "universities:edit_global", "universities:edit_scoped",
    "content:draft", "content:publish", "data:rollback", "data:bulk_mutate",
    "moderation:review", "audit:view", "data:export_snapshot"
  ],
  ADMIN: [
    "users:manage_staff", "universities:create_delete", "universities:edit_global", "universities:edit_scoped",
    "content:draft", "content:publish", "data:rollback", "data:bulk_mutate",
    "moderation:review", "audit:view", "data:export_snapshot"
  ],
  CONTENT_EDITOR: [
    "universities:edit_global", "universities:edit_scoped",
    "content:draft", "content:publish", "moderation:review"
  ],
  UNIVERSITY_REP: [
    "universities:edit_scoped", "content:draft", "content:publish", "moderation:review"
  ],
  COMMUNITY_MODERATOR: [
    "moderation:review"
  ],
  STUDENT: []
};

async function seedDefaultRolesAndPermissions() {
  console.log("Seeding default permissions...");
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      create: perm,
      update: { description: perm.description }
    });
  }

  console.log("Seeding default roles & permission bindings...");
  for (const roleData of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: { key: roleData.key },
      create: roleData,
      update: { name: roleData.name, description: roleData.description, hierarchyLevel: roleData.hierarchyLevel }
    });

    const targetPermCodes = ROLE_PERMISSIONS_MAP[roleData.key] || [];
    const perms = await prisma.permission.findMany({
      where: { code: { in: targetPermCodes } }
    });

    for (const p of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        create: { roleId: role.id, permissionId: p.id },
        update: {}
      });
    }
  }
}

async function main() {
  console.log("--- Starting Bootstrap Seeding Protocol ---");
  await seedDefaultRolesAndPermissions();

  const superAdminEmail = process.env.INITIAL_SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) {
    console.log("INITIAL_SUPER_ADMIN_EMAIL is not set in environment. Skipping initial user elevation.");
    return;
  }

  // ONE-TIME LOCKOUT CHECK:
  // If ANY user is already assigned SUPER_ADMIN, lock out further automatic elevations
  const existingSuperAdmin = await prisma.userRoleAssignment.findFirst({
    where: { role: { key: "SUPER_ADMIN" } }
  });

  if (existingSuperAdmin) {
    console.log("🔒 Super Admin already provisioned. Bootstrap path permanently locked.");
    return;
  }

  const superAdminRole = await prisma.role.findUnique({ where: { key: "SUPER_ADMIN" } });
  if (!superAdminRole) throw new Error("SUPER_ADMIN role definition not found");

  const targetUser = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (!targetUser) {
    console.log(`⚠️ User with email [${superAdminEmail}] not found in database. Register this account first, then re-run seed.`);
    return;
  }

  await prisma.userRoleAssignment.create({
    data: {
      userId: targetUser.id,
      roleId: superAdminRole.id,
      assignedBy: "SYSTEM_BOOTSTRAP"
    }
  });

  await prisma.user.update({
    where: { id: targetUser.id },
    data: { role: "SUPER_ADMIN", status: "ACTIVE" }
  });

  console.log(`👑 Successfully bootstrapped initial Super Admin: ${superAdminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
