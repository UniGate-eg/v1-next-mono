import { AuditLogRepository } from "../repositories/AuditLogRepository";
import { prisma } from "../../lib/prisma";
import { CreateDegreeProgramInput, UpdateDegreeProgramInput } from "../../schemas/program.schema";
import { CacheInvalidator } from "../../lib/cache-invalidator";

const defaultAuditRepo = new AuditLogRepository(prisma);

export class AdminProgramService {
  static async createProgram(actorId: string, data: CreateDegreeProgramInput, auditRepo = defaultAuditRepo) {
    const program = await prisma.degreeProgram.create({
      data: {
        slug: data.slug,
        universityId: data.universityId,
        facultyId: data.facultyId,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        degreeType: data.degreeType,
        durationYears: data.durationYears,
        studyLanguage: data.studyLanguage,
        tuitionEgpPerYear: data.tuitionEgpPerYear,
        tuitionUsdPerYear: data.tuitionUsdPerYear,
        careerOpportunities: data.careerOpportunities || [],
        dualDegreePartner: data.dualDegreePartner,
      },
      include: {
        university: { select: { slug: true } }
      }
    });

    await auditRepo.create({
      universityId: data.universityId,
      actorId,
      action: "CREATE_PROGRAM",
      entityType: "DegreeProgram",
      entityId: program.id,
      afterState: data,
    });

    if (program.university?.slug) {
      CacheInvalidator.invalidateUniversity(program.university.slug);
    }
    return program;
  }

  static async updateProgram(actorId: string, id: string, data: UpdateDegreeProgramInput, auditRepo = defaultAuditRepo) {
    const original = await prisma.degreeProgram.findUnique({
      where: { id },
      include: { university: { select: { slug: true } } }
    });
    if (!original) throw new Error("Degree Program not found");

    const program = await prisma.degreeProgram.update({
      where: { id },
      data: {
        slug: data.slug,
        facultyId: data.facultyId,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        degreeType: data.degreeType,
        durationYears: data.durationYears,
        studyLanguage: data.studyLanguage,
        tuitionEgpPerYear: data.tuitionEgpPerYear,
        tuitionUsdPerYear: data.tuitionUsdPerYear,
        careerOpportunities: data.careerOpportunities,
        dualDegreePartner: data.dualDegreePartner,
      },
      include: { university: { select: { slug: true } } }
    });

    await auditRepo.create({
      universityId: original.universityId,
      actorId,
      action: "UPDATE_PROGRAM",
      entityType: "DegreeProgram",
      entityId: id,
      beforeState: original,
      afterState: data,
    });

    if (program.university?.slug) {
      CacheInvalidator.invalidateUniversity(program.university.slug);
    }
    return program;
  }

  static async deleteProgram(actorId: string, id: string, auditRepo = defaultAuditRepo) {
    const original = await prisma.degreeProgram.findUnique({
      where: { id },
      include: { university: { select: { slug: true } } }
    });
    if (!original) throw new Error("Degree Program not found");

    await prisma.degreeProgram.delete({ where: { id } });

    await auditRepo.create({
      universityId: original.universityId,
      actorId,
      action: "DELETE_PROGRAM",
      entityType: "DegreeProgram",
      entityId: id,
      beforeState: original,
      afterState: null,
    });

    if (original.university?.slug) {
      CacheInvalidator.invalidateUniversity(original.university.slug);
    }
  }
}
