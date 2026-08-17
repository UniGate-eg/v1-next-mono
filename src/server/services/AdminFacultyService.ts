import { auditLogRepository } from "../../lib/di";
import { CreateFacultyInput, UpdateFacultyInput } from "../../schemas/faculty.schema";
import { CacheInvalidator } from "../../lib/cache-invalidator";
import { primary } from "../../lib/prisma";
import { FacultyMapper } from "../mappers/FacultyMapper";
import { FacultyDTO } from "../../types/university.types";

export class AdminFacultyService {
  static async createFaculty(actorId: string, data: CreateFacultyInput): Promise<FacultyDTO> {
    const faculty = await primary.faculty.create({
      data: {
        universityId: data.universityId,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        deanName: data.deanName,
        departments: data.departments,
      }
    });
    
    await auditLogRepository.create({
      universityId: data.universityId,
      actorId,
      action: "CREATE_FACULTY",
      entityType: "Faculty",
      entityId: faculty.id,
      afterState: data,
    });

    const university = await primary.university.findUnique({ where: { id: data.universityId } });
    if (university) CacheInvalidator.invalidateUniversity(university.slug);

    return FacultyMapper.toDTO(faculty);
  }

  static async updateFaculty(actorId: string, id: string, data: UpdateFacultyInput): Promise<FacultyDTO> {
    const original = await primary.faculty.findUnique({ where: { id } });
    if (!original) throw new Error("Faculty not found");

    const { id: _ignore, ...updateData } = data;
    const faculty = await primary.faculty.update({
      where: { id },
      data: updateData as any
    });

    await auditLogRepository.create({
      universityId: faculty.universityId,
      actorId,
      action: "UPDATE_FACULTY",
      entityType: "Faculty",
      entityId: id,
      beforeState: original,
      afterState: data,
    });

    const university = await primary.university.findUnique({ where: { id: faculty.universityId } });
    if (university) CacheInvalidator.invalidateUniversity(university.slug);

    return FacultyMapper.toDTO(faculty);
  }

  static async deleteFaculty(actorId: string, id: string): Promise<void> {
    const original = await primary.faculty.findUnique({ where: { id } });
    if (!original) throw new Error("Faculty not found");

    await primary.faculty.delete({ where: { id } });

    await auditLogRepository.create({
      universityId: original.universityId,
      actorId,
      action: "DELETE_FACULTY",
      entityType: "Faculty",
      entityId: id,
      beforeState: original,
    });

    const university = await primary.university.findUnique({ where: { id: original.universityId } });
    if (university) CacheInvalidator.invalidateUniversity(university.slug);
  }
}
