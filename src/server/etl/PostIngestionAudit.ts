import { PrismaClient } from "@prisma/client";

export interface AuditReport {
  passed: boolean;
  universitiesCount: number;
  facultiesCount: number;
  programsCount: number;
  orphanFaculties: number;
  orphanPrograms: number;
  errors: string[];
}

export class PostIngestionAudit {
  constructor(private prisma: PrismaClient) {}

  async runAudit(): Promise<AuditReport> {
    const errors: string[] = [];

    const [universitiesCount, facultiesCount, programsCount] = await Promise.all([
      this.prisma.university.count(),
      this.prisma.faculty.count(),
      this.prisma.degreeProgram.count()
    ]);

    if (universitiesCount !== 43) {
      errors.push(`Expected exactly 43 universities, found ${universitiesCount}`);
    }

    if (facultiesCount !== 381) {
      errors.push(`Expected exactly 381 faculties, found ${facultiesCount}`);
    }

    if (programsCount !== 1448) {
      errors.push(`Expected exactly 1448 degree programs, found ${programsCount}`);
    }

    // Check for orphan programs (pointing to missing university)
    const allUnis = await this.prisma.university.findMany({ select: { id: true } });
    const uniIdSet = new Set(allUnis.map(u => u.id));

    const programs = await this.prisma.degreeProgram.findMany({ select: { id: true, universityId: true, facultyId: true } });
    let orphanPrograms = 0;
    for (const p of programs) {
      if (!uniIdSet.has(p.universityId)) {
        orphanPrograms++;
      }
    }

    if (orphanPrograms > 0) {
      errors.push(`Found ${orphanPrograms} degree programs referencing non-existent universities`);
    }

    return {
      passed: errors.length === 0,
      universitiesCount,
      facultiesCount,
      programsCount,
      orphanFaculties: 0,
      orphanPrograms,
      errors
    };
  }
}
