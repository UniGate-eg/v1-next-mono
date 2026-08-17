import { Faculty } from "@prisma/client";
import { FacultyDTO } from "../../types/university.types";

export class FacultyMapper {
  static toDTO(faculty: any): FacultyDTO {
    return {
      id: faculty.id,
      universityId: faculty.universityId,
      nameEn: faculty.nameEn,
      nameAr: faculty.nameAr,
      descriptionEn: faculty.descriptionEn,
      descriptionAr: faculty.descriptionAr,
      deanName: faculty.deanName,
      departments: faculty.departments,
      createdAt: faculty.createdAt,
      updatedAt: faculty.updatedAt,
      degreePrograms: faculty.degreePrograms 
        ? faculty.degreePrograms.map((dp: any) => ({
            id: dp.id,
            slug: dp.slug,
            nameEn: dp.nameEn,
            nameAr: dp.nameAr,
            degreeType: dp.degreeType,
            durationYears: dp.durationYears,
            studyLanguage: dp.studyLanguage,
          }))
        : undefined,
    };
  }
}
