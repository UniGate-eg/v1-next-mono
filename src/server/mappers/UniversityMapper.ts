import { University } from "@prisma/client";
import { UniversityDTO, SlimSearchToken } from "../../types/university.types";
import { FacultyMapper } from "./FacultyMapper";
import { DegreeProgramMapper } from "./DegreeProgramMapper";

export class UniversityMapper {
  static toDTO(university: any): UniversityDTO {
    return {
      id: university.id,
      slug: university.slug,
      shortName: university.shortName,
      emoji: university.emoji,
      nameEn: university.nameEn,
      nameAr: university.nameAr,
      educationModel: university.educationModel,
      type: university.type,
      governorate: university.governorate,
      city: university.city,
      addressEn: university.addressEn,
      addressAr: university.addressAr,
      overviewEn: university.overviewEn,
      overviewAr: university.overviewAr,
      website: university.website,
      logoUrl: university.logoUrl,
      established: university.established,
      qsRanking: university.qsRanking,
      theRanking: university.theRanking,
      phones: university.phones,
      emails: university.emails,
      socialLinks: typeof university.socialLinks === 'object' && university.socialLinks !== null 
        ? university.socialLinks as Record<string, string> 
        : null,
      strengthsEn: university.strengthsEn,
      strengthsAr: university.strengthsAr,
      publishStatus: university.publishStatus,
      createdAt: university.createdAt,
      updatedAt: university.updatedAt,
      
      faculties: university.faculties ? university.faculties.map(FacultyMapper.toDTO) : undefined,
      degreePrograms: university.degreePrograms ? university.degreePrograms.map(DegreeProgramMapper.toDTO) : undefined,
      accreditations: university.accreditations ? university.accreditations.map((a: any) => ({
        id: a.id,
        universityId: a.universityId,
        name: a.name,
        fullName: a.fullName,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      })) : undefined,
    };
  }

  static toSlimSearchToken(university: any): SlimSearchToken {
    return {
      id: university.id,
      slug: university.slug,
      nameEn: university.nameEn,
      nameAr: university.nameAr,
      type: university.type,
      emoji: university.emoji,
      city: university.city,
      educationModel: university.educationModel,
    };
  }
}
