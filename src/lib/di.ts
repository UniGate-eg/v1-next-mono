import { prisma } from "./prisma";
import { PostgresUserRepository } from "../server/repositories/PostgresUserRepository";
import { PostgresRoleRepository } from "../server/repositories/PostgresRoleRepository";
import { PostgresPermissionRepository } from "../server/repositories/PostgresPermissionRepository";
import { PostgresUserRoleAssignmentRepository } from "../server/repositories/PostgresUserRoleAssignmentRepository";
import { PostgresAdminNotificationRepository } from "../server/repositories/PostgresAdminNotificationRepository";
import { AuditLogRepository } from "../server/repositories/AuditLogRepository";
import { PostgresSuggestionRepository } from "../server/repositories/SuggestionRepository";
import { PostgresUniversityRepository } from "../server/repositories/PostgresUniversityRepository";

import { RbacService } from "../server/services/RbacService";
import { UserManagementService } from "../server/services/UserManagementService";
import { AdminCatalogService } from "../server/services/AdminCatalogService";
import { RollbackService } from "../server/services/RollbackService";
import { BulkOperationService } from "../server/services/BulkOperationService";
import { NotificationService } from "../server/services/NotificationService";
import { RoleManagementService } from "../server/services/RoleManagementService";
import { SuggestionService } from "../server/services/SuggestionService";
import { UniversityService } from "../server/services/UniversityService";

// Repositories
export const userRepository = new PostgresUserRepository(prisma);
export const roleRepository = new PostgresRoleRepository(prisma);
export const permissionRepository = new PostgresPermissionRepository(prisma);
export const userRoleAssignmentRepository = new PostgresUserRoleAssignmentRepository(prisma);
export const adminNotificationRepository = new PostgresAdminNotificationRepository(prisma);
export const auditLogRepository = new AuditLogRepository(prisma);
export const suggestionRepository = new PostgresSuggestionRepository(prisma);
export const universityRepository = new PostgresUniversityRepository(prisma);

// Domain Services
export const rbacService = new RbacService(prisma);
export const adminCatalogService = new AdminCatalogService(prisma);
export const rollbackService = new RollbackService(prisma, adminCatalogService);
export const bulkOperationService = new BulkOperationService(prisma, adminCatalogService);
export const notificationService = new NotificationService(adminNotificationRepository, userRoleAssignmentRepository);
export const userManagementService = new UserManagementService(userRepository, roleRepository, userRoleAssignmentRepository, auditLogRepository);
export const roleManagementService = new RoleManagementService(roleRepository, permissionRepository, auditLogRepository);
export const suggestionService = new SuggestionService();
export const publicUniversityService = new UniversityService(universityRepository);
