import { DegreeProgram } from "@prisma/client";
import { DegreeProgramDTO } from "../../types/university.types";

export class DegreeProgramMapper {
  static toDTO(program: any): DegreeProgramDTO {
    return {
      id: program.id,
      slug: program.slug,
      universityId: program.universityId,
      facultyId: program.facultyId,
      nameEn: program.nameEn,
      nameAr: program.nameAr,
      degreeType: program.degreeType,
      durationYears: program.durationYears,
      studyLanguage: program.studyLanguage,
      tuitionEgpPerYear: program.tuitionEgpPerYear,
      tuitionUsdPerYear: program.tuitionUsdPerYear,
      careerOpportunities: program.careerOpportunities,
      dualDegreePartner: program.dualDegreePartner,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    };
  }
}
