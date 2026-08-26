"use client";

import React from "react";
import { PermissionCode } from "../../../types/rbac.types";
import { usePermission } from "../../../hooks/usePermission";

interface PermissionGuardProps {
  permission: PermissionCode;
  universityId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  universityId,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission, universityId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
