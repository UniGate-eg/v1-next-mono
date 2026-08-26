interface CompletenessCheckpoint {
  field: string;
  weight: number;
  isMet: (u: any) => boolean;
}

export class CompletenessScoreEngine {
  static readonly CHECKPOINTS: CompletenessCheckpoint[] = [
    { field: "nameEn", weight: 8, isMet: u => Boolean(u.nameEn && u.nameEn.trim().length > 0) },
    { field: "nameAr", weight: 8, isMet: u => Boolean(u.nameAr && u.nameAr.trim().length > 0) },
    { field: "overviewEn", weight: 10, isMet: u => Boolean(u.overviewEn && u.overviewEn.trim().length > 100) },
    { field: "overviewAr", weight: 10, isMet: u => Boolean(u.overviewAr && u.overviewAr.trim().length > 100) },
    { field: "logoUrl", weight: 8, isMet: u => Boolean(u.logoUrl && u.logoUrl.trim().length > 0) },
    { field: "website", weight: 5, isMet: u => Boolean(u.website && u.website.trim().length > 0) },
    { field: "governorate", weight: 5, isMet: u => Boolean(u.governorate && u.governorate.trim().length > 0) },
    { field: "established", weight: 5, isMet: u => Boolean(u.established && u.established > 1800) },
    { field: "phones", weight: 5, isMet: u => Boolean(Array.isArray(u.phones) && u.phones.length > 0) },
    { field: "emails", weight: 5, isMet: u => Boolean(Array.isArray(u.emails) && u.emails.length > 0) },
    { field: "faculties", weight: 10, isMet: u => Boolean(u.faculties && u.faculties.length > 0) || Boolean(u._count?.faculties > 0) },
    { field: "degreePrograms", weight: 10, isMet: u => Boolean(u.degreePrograms && u.degreePrograms.length > 0) || Boolean(u._count?.degreePrograms > 0) },
    {
      field: "tuition",
      weight: 8,
      isMet: u => {
        if (Array.isArray(u.degreePrograms) && u.degreePrograms.length > 0) {
          return u.degreePrograms.some((p: any) => p.tuitionEgpPerYear !== null || p.tuitionUsdPerYear !== null);
        }
        return false;
      }
    },
    { field: "accreditations", weight: 3, isMet: u => Boolean(u.accreditations && u.accreditations.length > 0) || Boolean(u._count?.accreditations > 0) },
  ];

  static calculateScore(university: any): number {
    let score = 0;
    for (const cp of CompletenessScoreEngine.CHECKPOINTS) {
      if (cp.isMet(university)) {
        score += cp.weight;
      }
    }
    return Math.min(100, Math.max(0, score));
  }

  static isStale(updatedAt: Date | string): boolean {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(updatedAt) < sixMonthsAgo;
  }
}
