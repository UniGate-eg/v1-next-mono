"use client";

import { usePermissionContext } from "../contexts/PermissionContext";
import { PermissionCode } from "../types/rbac.types";

export function usePermission(code?: PermissionCode, universityId?: string) {
  const context = usePermissionContext();

  const allowed = code ? context.hasPermission(code, universityId) : true;

  return {
    ...context,
    allowed,
    check: (perm: PermissionCode, uId?: string) => context.hasPermission(perm, uId),
  };
}
