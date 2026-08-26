"use client";

import React, { createContext, useContext, useMemo } from "react";
import { PermissionCode, UserContext } from "../types/rbac.types";
import { RoleDTO } from "../types/role.types";

interface PermissionContextValue {
  user: {
    id: string;
    email: string;
    name: string;
    status: "ACTIVE" | "SUSPENDED";
    roles: RoleDTO[];
    hierarchyLevel: number;
    assignedUniversityIds: string[] | "GLOBAL";
  } | null;
  permissions: PermissionCode[];
  hasPermission: (code: PermissionCode, universityId?: string) => boolean;
  hasRole: (roleKey: string) => boolean;
  isScopedTo: (universityId: string) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({
  children,
  initialUser,
  initialPermissions,
}: {
  children: React.ReactNode;
  initialUser: PermissionContextValue["user"];
  initialPermissions: PermissionCode[];
}) {
  const permissionsSet = useMemo(() => new Set(initialPermissions), [initialPermissions]);

  const value = useMemo<PermissionContextValue>(() => {
    const isSuperAdmin = Boolean(initialUser?.roles.some(r => r.key === "SUPER_ADMIN") || initialUser?.hierarchyLevel === 0);
    const isAdmin = Boolean(isSuperAdmin || initialUser?.roles.some(r => r.key === "ADMIN"));

    const isScopedTo = (universityId: string) => {
      if (!initialUser) return false;
      if (initialUser.assignedUniversityIds === "GLOBAL") return true;
      return initialUser.assignedUniversityIds.includes(universityId);
    };

    const hasPermission = (code: PermissionCode, universityId?: string) => {
      if (!permissionsSet.has(code)) return false;
      if (universityId) return isScopedTo(universityId);
      return true;
    };

    const hasRole = (roleKey: string) => {
      return Boolean(initialUser?.roles.some(r => r.key === roleKey));
    };

    return {
      user: initialUser,
      permissions: initialPermissions,
      hasPermission,
      hasRole,
      isScopedTo,
      isSuperAdmin,
      isAdmin,
    };
  }, [initialUser, initialPermissions, permissionsSet]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used within a PermissionProvider");
  }
  return context;
}
