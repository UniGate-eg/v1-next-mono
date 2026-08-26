import { AuditLogRepository } from "../repositories/AuditLogRepository";
import { prisma } from "../../lib/prisma";
import { CreateFacultyInput, UpdateFacultyInput } from "../../schemas/faculty.schema";
import { CacheInvalidator } from "../../lib/cache-invalidator";

const defaultAuditRepo = new AuditLogRepository(prisma);

export class AdminFacultyService {
  static async createFaculty(actorId: string, data: CreateFacultyInput, auditRepo = defaultAuditRepo) {
    const faculty = await prisma.faculty.create({
      data: {
        universityId: data.universityId,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        deanName: data.deanName,
        departments: data.departments || [],
      },
      include: {
        university: {
          select: { slug: true }
        }
      }
    });

    await auditRepo.create({
      universityId: data.universityId,
      actorId,
      action: "CREATE_FACULTY",
      entityType: "Faculty",
      entityId: faculty.id,
      afterState: data,
    });

    if (faculty.university?.slug) {
      CacheInvalidator.invalidateUniversity(faculty.university.slug);
    }
    return faculty;
  }

  static async updateFaculty(actorId: string, id: string, data: UpdateFacultyInput, auditRepo = defaultAuditRepo) {
    const original = await prisma.faculty.findUnique({
      where: { id },
      include: { university: { select: { slug: true } } }
    });
    if (!original) throw new Error("Faculty not found");

    const faculty = await prisma.faculty.update({
      where: { id },
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        deanName: data.deanName,
        departments: data.departments,
      },
      include: { university: { select: { slug: true } } }
    });

    await auditRepo.create({
      universityId: original.universityId,
      actorId,
      action: "UPDATE_FACULTY",
      entityType: "Faculty",
      entityId: id,
      beforeState: original,
      afterState: data,
    });

    if (faculty.university?.slug) {
      CacheInvalidator.invalidateUniversity(faculty.university.slug);
    }
    return faculty;
  }

  static async deleteFaculty(actorId: string, id: string, auditRepo = defaultAuditRepo) {
    const original = await prisma.faculty.findUnique({
      where: { id },
      include: { university: { select: { slug: true } } }
    });
    if (!original) throw new Error("Faculty not found");

    await prisma.faculty.delete({
      where: { id }
    });

    await auditRepo.create({
      universityId: original.universityId,
      actorId,
      action: "DELETE_FACULTY",
      entityType: "Faculty",
      entityId: id,
      beforeState: original,
      afterState: null,
    });

    if (original.university?.slug) {
      CacheInvalidator.invalidateUniversity(original.university.slug);
    }
  }
}
