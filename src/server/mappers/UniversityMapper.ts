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
    const modelEmojiMap: Record<string, string> = {
      AMERICAN: "🎓",
      GERMAN: "🏛️",
      BRITISH: "🏫",
      EGYPTIAN: "🇪🇬",
      FRENCH: "🗼",
      CANADIAN: "🍁",
    };

    const gradientMap: Record<string, string> = {
      AMERICAN: "linear-gradient(135deg, #2563EB, #7C3AED)",
      GERMAN: "linear-gradient(135deg, #059669, #0D9488)",
      BRITISH: "linear-gradient(135deg, #DC2626, #EA580C)",
      EGYPTIAN: "linear-gradient(135deg, #7C3AED, #DB2777)",
      FRENCH: "linear-gradient(135deg, #4F46E5, #06B6D4)",
      CANADIAN: "linear-gradient(135deg, #D97706, #DC2626)",
    };

    const modelKey = String(university.educationModel || "").toUpperCase();

    // Compute structured faculties and degree programs
    const structuredFaculties = Array.isArray(university.faculties)
      ? university.faculties.map((f: any) => ({
          id: f.id,
          nameEn: f.nameEn || f.name_en || f.name || "",
          nameAr: f.nameAr || f.name_ar || f.nameEn || f.name || "",
          deanName: f.deanName || f.dean_name || null,
          descriptionEn: f.descriptionEn || f.description_en || null,
          descriptionAr: f.descriptionAr || f.description_ar || null,
          departments: Array.isArray(f.departments) ? f.departments : [],
        }))
      : [];

    const degreePrograms = Array.isArray(university.degreePrograms)
      ? university.degreePrograms.map((p: any) => ({
          id: p.id,
          facultyId: p.facultyId,
          nameEn: p.nameEn || p.name_en || p.name || "",
          nameAr: p.nameAr || p.name_ar || p.nameEn || p.name || "",
          degreeType: p.degreeType || "B.Sc.",
          durationYears: p.durationYears || null,
          tuitionEgpPerYear: p.tuitionEgpPerYear || null,
          studyLanguage: p.studyLanguage || "English",
        }))
      : [];

    const facultiesEn = structuredFaculties.map((f: any) => f.nameEn).filter(Boolean);
    const facultiesAr = structuredFaculties.map((f: any) => f.nameAr).filter(Boolean);

    return {
      id: university.id,
      slug: university.slug,
      nameEn: university.nameEn,
      nameAr: university.nameAr,
      shortName: university.shortName,
      type: university.type,
      emoji: university.emoji || "🏛️",
      modelEmoji: modelEmojiMap[modelKey] || "🎓",
      city: university.city || university.governorate,
      governorate: university.governorate,
      educationModel: university.educationModel,
      established: university.established,
      overviewEn: university.overviewEn,
      overviewAr: university.overviewAr,
      description: university.overviewEn,
      description_ar: university.overviewAr,
      qsRanking: university.qsRanking,
      theRanking: university.theRanking,
      strengthsEn: university.strengthsEn || [],
      strengthsAr: university.strengthsAr || [],
      faculties: facultiesEn,
      faculties_ar: facultiesAr,
      structured_faculties: structuredFaculties,
      degreePrograms: degreePrograms,
      website: university.website || null,
      phones: Array.isArray(university.phones) ? university.phones : [],
      emails: Array.isArray(university.emails) ? university.emails : [],
      socialLinks: university.socialLinks || null,
      accentGradient: gradientMap[modelKey] || "linear-gradient(135deg, #7C3AED, #EC4899)",
      featured: Boolean(university.qsRanking && university.qsRanking !== "N/A"),
    };
  }
}
