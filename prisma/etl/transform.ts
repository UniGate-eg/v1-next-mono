export interface RawUniversity {
  [key: string]: any;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseTuition(tuitionString: any): number | null {
  if (!tuitionString) return null;
  if (typeof tuitionString === "number") return tuitionString;
  const match = String(tuitionString).replace(/,/g, "").match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function mapEducationModel(model?: string): "AMERICAN" | "GERMAN" | "BRITISH" | "EGYPTIAN" | "FRENCH" | "CANADIAN" {
  if (!model) return "EGYPTIAN";
  const m = model.toUpperCase();
  if (m.includes("GERMAN") || m.includes("ألماني")) return "GERMAN";
  if (m.includes("AMERICAN") || m.includes("أمريكي")) return "AMERICAN";
  if (m.includes("BRITISH") || m.includes("بريطاني")) return "BRITISH";
  if (m.includes("FRENCH") || m.includes("فرنسي")) return "FRENCH";
  if (m.includes("CANADIAN") || m.includes("كندي")) return "CANADIAN";
  return "EGYPTIAN";
}

export function mapUniversityType(type?: string): "PUBLIC" | "PRIVATE" | "NATIONAL" | "INTERNATIONAL" {
  if (!type) return "PUBLIC";
  const t = type.toUpperCase();
  if (t.includes("NATIONAL") || t.includes("أهلية")) return "NATIONAL";
  if (t.includes("INTERNATIONAL") || t.includes("دولية")) return "INTERNATIONAL";
  if (t.includes("PRIVATE") || t.includes("خاصة")) return "PRIVATE";
  return "PUBLIC";
}

export function transformUniversity(raw: RawUniversity) {
  const nameEn = raw.nameEn || raw.name || "Unknown University";
  const nameAr = raw.nameAr || raw.name_ar || nameEn;
  const slug = raw.slug || generateSlug(nameEn);

  // Transform University Data
  const universityData = {
    slug,
    nameEn,
    nameAr,
    shortName: raw.shortName || null,
    emoji: raw.emoji || "🏛️",
    educationModel: mapEducationModel(raw.educationModel || raw.model),
    type: mapUniversityType(raw.type),
    governorate: raw.governorate || (raw.location && raw.location.includes("Cairo") ? "Cairo" : raw.location && raw.location.includes("Giza") ? "Giza" : "Cairo"),
    city: raw.city || raw.location || null,
    addressEn: raw.addressEn || raw.address || null,
    addressAr: raw.addressAr || raw.address_ar || null,
    overviewEn: raw.overviewEn || raw.overview || raw.description || null,
    overviewAr: raw.overviewAr || raw.overview_ar || raw.description_ar || null,
    website: raw.website || null,
    logoUrl: raw.logoUrl || null,
    established: typeof raw.established === "number" ? raw.established : typeof raw.founded === "number" ? raw.founded : null,
    qsRanking: raw.qsRanking || raw.qs_ranking || null,
    theRanking: raw.theRanking || raw.the_ranking || null,
    phones: Array.isArray(raw.phones) ? raw.phones : [],
    emails: Array.isArray(raw.emails) ? raw.emails : [],
    socialLinks: typeof raw.social_links === "object" ? raw.social_links : typeof raw.socialLinks === "object" ? raw.socialLinks : null,
    strengthsEn: Array.isArray(raw.strengthsEn) ? raw.strengthsEn : Array.isArray(raw.strengths) ? raw.strengths : [],
    strengthsAr: Array.isArray(raw.strengthsAr) ? raw.strengthsAr : Array.isArray(raw.strengths_ar) ? raw.strengths_ar : [],
    publishStatus: "PUBLISHED",
  };

  // Transform Faculties
  let faculties: any[] = [];
  if (Array.isArray(raw.structured_faculties) && raw.structured_faculties.length > 0) {
    faculties = raw.structured_faculties.map((f: any) => ({
      nameEn: f.name_en || f.nameEn || f.name,
      nameAr: f.name_ar || f.nameAr || f.name_en || f.nameEn || f.name,
      deanName: f.dean_name || f.deanName || null,
      descriptionEn: f.description_en || f.descriptionEn || null,
      descriptionAr: f.description_ar || f.descriptionAr || null,
      departments: Array.isArray(f.departments) ? f.departments : [],
    }));
  } else if (Array.isArray(raw.faculties) && raw.faculties.length > 0) {
    faculties = raw.faculties.map((f: any, idx: number) => {
      if (typeof f === "string") {
        return {
          nameEn: f,
          nameAr: Array.isArray(raw.faculties_ar) && raw.faculties_ar[idx] ? raw.faculties_ar[idx] : f,
          deanName: null,
          descriptionEn: null,
          descriptionAr: null,
          departments: [],
        };
      }
      return {
        nameEn: f.nameEn || f.name_en || f.name,
        nameAr: f.nameAr || f.name_ar || f.nameEn || f.name,
        deanName: f.deanName || f.dean_name || null,
        descriptionEn: f.descriptionEn || f.description_en || null,
        descriptionAr: f.descriptionAr || f.description_ar || null,
        departments: Array.isArray(f.departments) ? f.departments : [],
      };
    });
  }

  // Transform Degree Programs
  let degreePrograms: any[] = [];
  if (Array.isArray(raw.programs) && raw.programs.length > 0) {
    degreePrograms = raw.programs.map((p: any) => ({
      facultyName: p.facultyName || p.faculty_name,
      data: {
        slug: generateSlug(`${p.degreeType || p.degree_type || "degree"}-${p.nameEn || p.name_en || p.name}-${slug}`),
        nameEn: p.nameEn || p.name_en || p.name,
        nameAr: p.nameAr || p.name_ar || p.nameEn || p.name,
        degreeType: p.degreeType || p.degree_type || "BACHELORS",
        durationYears: p.durationYears || p.duration || 4,
        studyLanguage: p.studyLanguage || p.study_language || "English",
        tuitionEgpPerYear: parseTuition(p.tuitionEgpPerYear || p.tuition_egp || p.tuition),
        tuitionUsdPerYear: parseTuition(p.tuitionUsdPerYear || p.tuition_usd),
      },
    }));
  } else if (Array.isArray(raw.majors) && raw.majors.length > 0) {
    degreePrograms = raw.majors.map((m: any) => {
      const title = typeof m === "string" ? m : m.nameEn || m.name;
      const isDoc = title.includes("Ph.D") || title.includes("Doctor");
      const isMaster = title.includes("M.Sc") || title.includes("Master") || title.includes("MBA");
      const degreeType = isDoc ? "DOCTORATE" : isMaster ? "MASTERS" : "BACHELORS";
      const duration = isDoc ? 3 : isMaster ? 2 : 4;

      return {
        facultyName: undefined,
        data: {
          slug: generateSlug(`${degreeType}-${title}-${slug}`),
          nameEn: title,
          nameAr: typeof m === "object" && m.nameAr ? m.nameAr : title,
          degreeType,
          durationYears: typeof m === "object" && m.duration ? m.duration : duration,
          studyLanguage: "English",
          tuitionEgpPerYear: null,
          tuitionUsdPerYear: null,
        },
      };
    });
  }

  // Transform Accreditations
  let accreditations: any[] = [];
  if (Array.isArray(raw.international_accreditations)) {
    accreditations = raw.international_accreditations.map((acc: string) => ({
      name: acc.includes("(") ? acc.split("(")[0].trim() : acc,
      fullName: acc,
    }));
  }

  return {
    slug,
    universityData,
    faculties,
    degreePrograms,
    accreditations,
  };
}
