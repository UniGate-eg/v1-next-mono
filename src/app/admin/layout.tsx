import { ReactNode } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPermissionsCached } from "@/server/services/RbacService";
import { getAdminSidebarData } from "./adminSidebarConfig";
import { Example } from "@/components/ui/dashboard-with-collapsible-sidebar";
import { PermissionProvider } from "@/contexts/PermissionContext";

export const metadata = {
  title: "UniGate — Operations & RBAC Console",
  description: "Administrative governance and catalog operations for Egyptian Higher Education",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/Logo_Kit/university-guide-logo-transparent.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/Logo_Kit/university-guide-logo-transparent.png" },
    ],
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userCtx = session?.user?.id
    ? await getUserPermissionsCached(prisma, session.user.id)
    : null;

  const sidebarData = getAdminSidebarData({
    name: userCtx?.name || session?.user?.name || "Mostafa Yaser",
    role: userCtx?.roles?.[0]?.name || "Super Admin",
  });

  const permissionsArray = userCtx?.permissions
    ? Array.from(userCtx.permissions)
    : [];

  return (
    <div className="admin-scope admin-body min-h-screen w-full">
      <PermissionProvider
        initialUser={
          userCtx
            ? {
                id: userCtx.id,
                email: userCtx.email,
                name: userCtx.name,
                status: userCtx.status as "ACTIVE" | "SUSPENDED",
                roles: userCtx.roles,
                hierarchyLevel: userCtx.hierarchyLevel,
                assignedUniversityIds: userCtx.assignedUniversityIds,
              }
            : null
        }
        initialPermissions={permissionsArray}
      >
        <Example data={sidebarData}>{children}</Example>
      </PermissionProvider>
    </div>
  );
}
