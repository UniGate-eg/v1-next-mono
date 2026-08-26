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
  title: "UniGate — Operations & RBAC Console",
  description: "High-performance administrative governance for Egyptian Higher Education",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/auth/login?redirect=/admin");
  }

  const userContext = await getUserPermissionsCached(prisma, session.user.id);

  if (!userContext || userContext.status === "SUSPENDED") {
    redirect("/?error=suspended");
  }

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
      <div className="admin-dark-theme min-h-screen w-full flex bg-[#07080D] text-slate-100 antialiased selection:bg-purple-500/30 selection:text-white leading-relaxed">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#07080D]">
          <AdminHeader />
          <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto custom-dark-scrollbar">
            <div className="w-full max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}
