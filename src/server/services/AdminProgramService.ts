import { auditLogRepository } from "../../lib/di";
import { CreateDegreeProgramInput, UpdateDegreeProgramInput } from "../../schemas/program.schema";
import { CacheInvalidator } from "../../lib/cache-invalidator";
import { primary } from "../../lib/prisma";
import { DegreeProgramMapper } from "../mappers/DegreeProgramMapper";
import { DegreeProgramDTO } from "../../types/university.types";

export class AdminProgramService {
  static async createProgram(actorId: string, data: CreateDegreeProgramInput): Promise<DegreeProgramDTO> {
    const program = await primary.degreeProgram.create({
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
        careerOpportunities: data.careerOpportunities,
        dualDegreePartner: data.dualDegreePartner,
      } as any
    });
    
    await auditLogRepository.create({
      universityId: data.universityId,
      actorId,
      action: "CREATE_PROGRAM",
      entityType: "DegreeProgram",
      entityId: program.id,
      afterState: data,
    });

    const university = await primary.university.findUnique({ where: { id: data.universityId } });
    if (university) CacheInvalidator.invalidateUniversity(university.slug);

    return DegreeProgramMapper.toDTO(program);
  }

  static async updateProgram(actorId: string, id: string, data: UpdateDegreeProgramInput): Promise<DegreeProgramDTO> {
    const original = await primary.degreeProgram.findUnique({ where: { id } });
    if (!original) throw new Error("Program not found");

    const { id: _ignore, ...updateData } = data;
    const program = await primary.degreeProgram.update({
      where: { id },
      data: updateData as any
    });

    await auditLogRepository.create({
      universityId: program.universityId,
      actorId,
      action: "UPDATE_PROGRAM",
      entityType: "DegreeProgram",
      entityId: id,
      beforeState: original,
      afterState: data,
    });

    const university = await primary.university.findUnique({ where: { id: program.universityId } });
    if (university) CacheInvalidator.invalidateUniversity(university.slug);

    return DegreeProgramMapper.toDTO(program);
  }

  static async deleteProgram(actorId: string, id: string): Promise<void> {
    const original = await primary.degreeProgram.findUnique({ where: { id } });
    if (!original) throw new Error("Program not found");

    await primary.degreeProgram.delete({ where: { id } });

    await auditLogRepository.create({
      universityId: original.universityId,
      actorId,
      action: "DELETE_PROGRAM",
      entityType: "DegreeProgram",
      entityId: id,
      beforeState: original,
    });

    const university = await primary.university.findUnique({ where: { id: original.universityId } });
    if (university) CacheInvalidator.invalidateUniversity(university.slug);
  }
}
