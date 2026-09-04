import { z } from "zod";
import { ParsedWorkbookData, RawUniversityRow, RawAcademicUnitRow, RawAcademicOfferingRow } from "./interfaces/IWorkbookParser";
import { UniversityEnrichmentRecord } from "./interfaces/IEnrichmentProvider";

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Common Arabic translations for academic faculties/schools in Egypt
export const FACULTY_ARABIC_DICTIONARY: Record<string, string> = {
  "faculty of medicine": "كلية الطب البشري",
  "school of medicine": "كلية الطب البشري",
  "faculty of dentistry": "كلية طب وجراحة الفم والأسنان",
  "school of dentistry": "كلية طب الأسنان",
  "faculty of oral and dental medicine": "كلية طب الفم والأسنان",
  "faculty of pharmacy": "كلية الصيدلة",
  "school of pharmacy": "كلية الصيدلة",
  "faculty of physical therapy": "كلية العلاج الطبيعي",
  "faculty of physiotherapy": "كلية العلاج الطبيعي",
  "faculty of engineering": "كلية الهندسة",
  "school of engineering": "كلية الهندسة",
  "school of sciences and engineering": "كلية العلوم والهندسة",
  "faculty of computer science": "كلية علوم الحاسب",
  "faculty of computers and artificial intelligence": "كلية الحاسبات والذكاء الاصطناعي",
  "faculty of computer science and artificial intelligence": "كلية علوم الحاسب والذكاء الاصطناعي",
  "faculty of computers and information": "كلية الحاسبات والمعلومات",
  "faculty of artificial intelligence": "كلية الذكاء الاصطناعي",
  "faculty of informatics and computer science": "كلية الحاسبات والمعلوماتية",
  "faculty of business administration": "كلية إدارة الأعمال",
  "school of business": "كلية إدارة الأعمال",
  "faculty of management and financial sciences": "كلية العلوم الإدارية والمالية",
  "faculty of commerce": "كلية التجارة وإدارة الأعمال",
  "faculty of mass communication": "كلية الإعلام وفنون الاتصال",
  "faculty of communication and mass media": "كلية الإعلام والاتصال",
  "faculty of applied arts": "كلية الفنون التطبيقية",
  "faculty of fine arts": "كلية الفنون الجميلة",
  "faculty of art and design": "كلية الفنون والتصميم",
  "school of humanities and social sciences": "كلية العلوم الإنسانية والاجتماعية",
  "faculty of languages and translation": "كلية الألسن واللغات التطبيقية",
  "faculty of al-alsun": "كلية الألسن",
  "faculty of biotechnology": "كلية التكنولوجيا الحيوية",
  "faculty of nursing": "كلية التمريض",
  "faculty of applied health sciences technology": "كلية تكنولوجيا العلوم الصحية التطبيقية",
  "faculty of technology and health sciences": "كلية العلوم الصحية والتكنولوجية",
  "faculty of law": "كلية الحقوق والمعاملات القانونية",
  "faculty of economics and political science": "كلية الاقتصاد والعلوم السياسية"
};

export function getArabicFacultyName(nameEn: string): string {
  const normalized = nameEn.trim().toLowerCase();
  if (FACULTY_ARABIC_DICTIONARY[normalized]) {
    return FACULTY_ARABIC_DICTIONARY[normalized];
  }
  for (const [key, ar] of Object.entries(FACULTY_ARABIC_DICTIONARY)) {
    if (normalized.includes(key)) {
      return ar;
    }
  }
  return nameEn;
}

export interface ValidatedUniversity {
  slug: string;
  sourceUniId: string;
  shortName: string;
  nameEn: string;
  nameAr: string;
  governorate: string;
  city?: string;
  type: any;
  educationModel: any;
  website?: string;
  established?: number;
  overviewEn?: string;
  overviewAr?: string;
  completenessScore: number;
}

export interface ValidatedFaculty {
  sourceUnitId: string;
  sourceUniId: string;
  nameEn: string;
  nameAr: string;
  unitType?: string;
}

export interface ValidatedProgram {
  slug: string;
  sourceOfferingId: string;
  sourceUnitId: string;
  sourceUniId: string;
  nameEn: string;
  nameAr: string;
  degreeType: string;
  durationYears: number;
  studyLanguage: string;
}

export interface ValidationReport {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    universitiesCount: number;
    facultiesCount: number;
    programsCount: number;
  };
  validatedData: {
    universities: ValidatedUniversity[];
    faculties: ValidatedFaculty[];
    programs: ValidatedProgram[];
  };
}

export class CatalogValidator {
  validate(
    workbooksData: ParsedWorkbookData[],
    enrichmentProvider: { getEnrichment: (short: string, nameEn: string) => UniversityEnrichmentRecord }
  ): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rawUnis: RawUniversityRow[] = [];
    const rawUnits: RawAcademicUnitRow[] = [];
    const rawOfferings: RawAcademicOfferingRow[] = [];

    // Aggregate sheets
    for (const wb of workbooksData) {
      rawUnis.push(...wb.universities);
      rawUnits.push(...wb.academicUnits);
      rawOfferings.push(...wb.academicOfferings);
    }

    // 1. Validate and Deduplicate Universities
    const uniMap = new Map<string, RawUniversityRow>();
    for (const u of rawUnis) {
      const id = (u.universityId || u.shortName).trim().toUpperCase();
      if (!uniMap.has(id)) {
        uniMap.set(id, u);
      }
    }

    const validatedUnis: ValidatedUniversity[] = [];
    const uniSlugSet = new Set<string>();

    for (const [id, u] of uniMap.entries()) {
      const short = (u.shortName || id).trim();
      const nameEn = u.universityName.trim();
      const enrichment = enrichmentProvider.getEnrichment(short, nameEn);

      const slug = slugify(short || nameEn);
      if (uniSlugSet.has(slug)) {
        errors.push(`Duplicate university slug detected: ${slug} for ${short}`);
      }
      uniSlugSet.add(slug);

      validatedUnis.push({
        slug,
        sourceUniId: id,
        shortName: short,
        nameEn,
        nameAr: enrichment.nameAr,
        governorate: enrichment.governorate,
        city: enrichment.city,
        type: enrichment.type,
        educationModel: enrichment.educationModel,
        website: enrichment.website || u.website,
        established: enrichment.established,
        overviewEn: enrichment.overviewEn,
        overviewAr: enrichment.overviewAr,
        completenessScore: 85
      });
    }

    // 2. Validate Academic Units (Faculties)
    const validUniIds = new Set(validatedUnis.map(u => u.sourceUniId));
    const validatedFaculties: ValidatedFaculty[] = [];
    const unitMap = new Map<string, ValidatedFaculty>();

    for (const unit of rawUnits) {
      const parentUniId = unit.universityId ? unit.universityId.trim().toUpperCase() : "";
      if (!validUniIds.has(parentUniId)) {
        errors.push(`Academic Unit '${unit.academicUnitName}' references unknown University ID '${parentUniId}'`);
        continue;
      }

      const unitId = unit.academicUnitId.trim();
      const nameEn = unit.academicUnitName.trim();
      const nameAr = getArabicFacultyName(nameEn);

      const validUnit: ValidatedFaculty = {
        sourceUnitId: unitId,
        sourceUniId: parentUniId,
        nameEn,
        nameAr,
        unitType: unit.unitType
      };

      unitMap.set(unitId, validUnit);
      validatedFaculties.push(validUnit);
    }

    // 3. Validate Academic Offerings (Degree Programs)
    const validatedPrograms: ValidatedProgram[] = [];
    const programSlugSet = new Set<string>();

    for (const off of rawOfferings) {
      const unitId = off.academicUnitId ? off.academicUnitId.trim() : "";
      const parentUnit = unitMap.get(unitId);
      if (!parentUnit) {
        errors.push(`Academic Offering '${off.officialName}' references unknown Academic Unit ID '${unitId}'`);
        continue;
      }

      const parentUniId = parentUnit.sourceUniId;
      const progName = off.officialName.trim();
      const rawSlug = slugify(`${parentUniId.toLowerCase()}-${progName}`);
      
      // Ensure deterministic collision-free slug per university
      let finalSlug = rawSlug;
      let counter = 1;
      while (programSlugSet.has(finalSlug)) {
        counter++;
        finalSlug = `${rawSlug}-${counter}`;
      }
      programSlugSet.add(finalSlug);

      validatedPrograms.push({
        slug: finalSlug,
        sourceOfferingId: off.offeringId.trim(),
        sourceUnitId: unitId,
        sourceUniId: parentUniId,
        nameEn: progName,
        nameAr: progName, // standard fallback
        degreeType: off.offeringType || "Bachelor",
        durationYears: 4,
        studyLanguage: "English"
      });
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      stats: {
        universitiesCount: validatedUnis.length,
        facultiesCount: validatedFaculties.length,
        programsCount: validatedPrograms.length
      },
      validatedData: {
        universities: validatedUnis,
        faculties: validatedFaculties,
        programs: validatedPrograms
      }
    };
  }
}
