import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { RbacService, getUserPermissionsCached } from "../services/RbacService";
import { PermissionCode, ActionResult, UserContext } from "../../types/rbac.types";

interface WithAdminAuthOptions<TInput> {
  universityIdExtractor?: (input: TInput) => string | undefined;
}

export function withAdminAuth<TInput, TOutput>(
  permissionCode: PermissionCode,
  handler: (ctx: UserContext, input: TInput) => Promise<TOutput>,
  options?: WithAdminAuthOptions<TInput>
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Session verification
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user?.id) {
        return { success: false, error: "Authentication required", code: 403 };
      }

      // 2. LIVE database check — verify account status (Zero-Trust Session Defense)
      const liveUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true, status: true }
      });

      if (!liveUser) {
        return { success: false, error: "User account not found", code: 403 };
      }

      if (liveUser.status === "SUSPENDED") {
        // Direct database session deletion on suspension
        if (session.session?.token) {
          await prisma.session.deleteMany({ where: { token: session.session.token } });
        }
        return { success: false, error: "Account is suspended. Access denied.", code: 403 };
      }

      // 3. Permission and scope check
      const rbacService = new RbacService(prisma);
      const targetUniversityId = options?.universityIdExtractor?.(input);
      const permitted = await rbacService.hasPermission(liveUser.id, permissionCode, targetUniversityId);

      if (!permitted) {
        return {
          success: false,
          error: `Forbidden: Missing required permission [${permissionCode}]${targetUniversityId ? " for target institution" : ""}`,
          code: 403
        };
      }

      // 4. Build UserContext (request-memoized via cache())
      const userContext = await getUserPermissionsCached(prisma, liveUser.id);
      if (!userContext) {
        return { success: false, error: "Unable to resolve user security context", code: 403 };
      }

      // 5. Execute handler
      const result = await handler(userContext, input);
      return { success: true, data: result };
    } catch (error) {
      console.error(`[withAdminAuth Error] [${permissionCode}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected server error occurred",
        code: 500
      };
    }
  };
}
