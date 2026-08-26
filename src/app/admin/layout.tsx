import { ReactNode } from "react";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getUserPermissionsCached } from "../../server/services/RbacService";
import { PermissionProvider } from "../../contexts/PermissionContext";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin | UniGate CMS & RBAC",
  description: "UniGate Administrative Portal & Dynamic Role-Based Access Control",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/auth/login?redirect=/admin");
  }

  // Load LIVE user permissions from PostgreSQL (Zero-Trust)
  const userContext = await getUserPermissionsCached(prisma, session.user.id);

  if (!userContext || userContext.status === "SUSPENDED") {
    redirect("/?error=suspended");
  }

  // Check if user has at least one administrative capability
  const hasAdminCapability =
    userContext.roles.length > 0 &&
    !userContext.roles.every((r) => r.key === "STUDENT");

  if (!hasAdminCapability) {
    redirect("/?error=unauthorized");
  }

  return (
    <PermissionProvider
      initialUser={{
        id: userContext.id,
        email: userContext.email,
        name: userContext.name,
        status: userContext.status,
        roles: userContext.roles,
        hierarchyLevel: userContext.hierarchyLevel,
        assignedUniversityIds: userContext.assignedUniversityIds,
      }}
      initialPermissions={Array.from(userContext.permissions)}
    >
      <div className="flex min-h-screen bg-slate-100/60 font-sans antialiased text-slate-900">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 sm:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </PermissionProvider>
  );
}
