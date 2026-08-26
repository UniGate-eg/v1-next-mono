import { adminCatalogService, universityRepository } from "../../lib/di";
import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getUserPermissionsCached } from "../../server/services/RbacService";
import { format } from "date-fns";
import { AdminDashboardView, DashboardKPIs } from "../../components/admin/AdminDashboardView";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userCtx = session?.user?.id
    ? await getUserPermissionsCached(prisma, session.user.id)
    : null;

  const kpis = await adminCatalogService.getDashboardKPIs(userCtx || undefined);
  const sampleUniversities = await universityRepository.findMany(undefined, 1, 4);

  const formattedAuditLogs = kpis.recentAuditLogs.map((log: any) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    actorEmail: log.actorEmail,
    actorId: log.actorId,
    createdAt: format(new Date(log.createdAt), "MMM d, HH:mm"),
    universityName: log.university?.nameEn || undefined,
  }));

  const formattedTopInstitutions = sampleUniversities.data.map((u) => ({
    id: u.id,
    name: u.nameEn,
    nameAr: u.nameAr,
    code: u.slug.slice(0, 4).toUpperCase(),
    programsCount: (u as any)._count?.degreePrograms || 24,
    status: u.publishStatus,
    type: u.type || "Public Institution",
  }));

  const dashboardData: DashboardKPIs = {
    totalUniversities: kpis.totalUniversities,
    publishedUniversities: kpis.publishedUniversities,
    draftUniversities: kpis.draftUniversities,
    totalPrograms: kpis.totalPrograms,
    pendingSuggestions: kpis.pendingSuggestions,
    totalStaff: kpis.totalStaff,
    recentAuditLogs: formattedAuditLogs,
    topInstitutions: formattedTopInstitutions,
    user: {
      name: userCtx?.name || session?.user?.name || "Mostafa Yaser",
      role: userCtx?.roles?.[0]?.name || "Super Admin",
    },
  };

  return <AdminDashboardView data={dashboardData} />;
}
