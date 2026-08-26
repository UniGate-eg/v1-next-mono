import { PrismaClient, Prisma } from "@prisma/client";
import { CompletenessScoreEngine } from "./CompletenessScoreEngine";
import { revalidateTag, revalidatePath } from "next/cache";

export class AdminCatalogService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardKPIs(userContext: any) {
    const isScoped = userContext.assignedUniversityIds !== "GLOBAL";
    const scopedIds = Array.isArray(userContext.assignedUniversityIds) ? userContext.assignedUniversityIds : [];

    const universityWhere: Prisma.UniversityWhereInput = isScoped ? { id: { in: scopedIds } } : {};
    const suggestionWhere: Prisma.SuggestionWhereInput = {
      status: "PENDING",
      ...(isScoped && { universityId: { in: scopedIds } })
    };

    const [
      totalUniversities,
      publishedUniversities,
      draftUniversities,
      totalPrograms,
      pendingSuggestions,
      totalStaff,
      recentAuditLogs
    ] = await this.prisma.$transaction([
      this.prisma.university.count({ where: universityWhere }),
      this.prisma.university.count({ where: { ...universityWhere, publishStatus: "PUBLISHED" } }),
      this.prisma.university.count({ where: { ...universityWhere, publishStatus: "DRAFT" } }),
      this.prisma.degreeProgram.count({ where: isScoped ? { universityId: { in: scopedIds } } : {} }),
      this.prisma.suggestion.count({ where: suggestionWhere }),
      this.prisma.userRoleAssignment.count(),
      this.prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { university: { select: { nameEn: true, nameAr: true, slug: true } } }
      })
    ]);

    return {
      totalUniversities,
      publishedUniversities,
      draftUniversities,
      totalPrograms,
      pendingSuggestions,
      totalStaff,
      recentAuditLogs,
    };
  }

  async recalculateUniversityScore(universityId: string): Promise<number> {
    const university = await this.prisma.university.findUnique({
      where: { id: universityId },
      include: {
        faculties: true,
        degreePrograms: true,
        accreditations: true,
      }
    });

    if (!university) return 0;

    const score = CompletenessScoreEngine.calculateScore(university);
    await this.prisma.university.update({
      where: { id: universityId },
      data: { completenessScore: score }
    });

    return score;
  }

  async invalidateUniversityCache(slug?: string, id?: string) {
    try {
      revalidatePath("/universities");
      revalidatePath("/admin/universities");
      if (slug) {
        revalidatePath(`/universities/${slug}`);
        revalidateTag(`university-${slug}`);
      }
      if (id) {
        revalidateTag(`university-id-${id}`);
      }
    } catch {
      // cache invalidation in non-request contexts
    }
  }
}
