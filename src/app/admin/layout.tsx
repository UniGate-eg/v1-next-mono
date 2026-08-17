import { ReactNode } from "react";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin | UniGate CMS",
  description: "UniGate University Content Management System",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Enforce Better Auth RBAC for the entire /admin namespace
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const user = session.user as any;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "EDITOR") {
    // If authenticated but insufficient privileges, maybe go back to home or a 403 page
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
