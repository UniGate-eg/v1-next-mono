export interface RawUniversity {
  slug?: string;
  nameEn: string;
  nameAr: string;
  type: string;
  governorate: string;
  city?: string;
  established?: number;
  faculties?: RawFaculty[];
  programs?: RawProgram[];
  [key: string]: any;
}

export interface RawFaculty {
  nameEn: string;
  nameAr: string;
  deanName?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  departments?: string[];
}

export interface RawProgram {
  nameEn: string;
  nameAr: string;
  facultyName?: string;
  degreeType: string;
  durationYears?: number;
  tuitionEgpPerYear?: string;
  tuitionUsdPerYear?: string;
}

export function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function parseTuition(tuitionString: string | undefined): number | null {
  if (!tuitionString) return null;
  const match = tuitionString.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function transformUniversity(raw: RawUniversity) {
  const slug = raw.slug || generateSlug(raw.nameEn);
  
  // Transform University Data
  const universityData = {
    slug,
    nameEn: raw.nameEn,
    nameAr: raw.nameAr,
    type: raw.type.toUpperCase().includes('PRIVATE') ? 'PRIVATE' : 
          raw.type.toUpperCase().includes('NATIONAL') ? 'NATIONAL' : 
          raw.type.toUpperCase().includes('INTERNATIONAL') ? 'INTERNATIONAL' : 'PUBLIC',
    governorate: raw.governorate || 'Cairo',
    city: raw.city || null,
    established: raw.established || null,
    educationModel: 'EGYPTIAN',
    publishStatus: 'PUBLISHED',
  };

  // Transform Faculties
  const faculties = (raw.faculties || []).map(f => ({
    nameEn: f.nameEn,
    nameAr: f.nameAr || f.nameEn,
    deanName: f.deanName || null,
    descriptionEn: f.descriptionEn || null,
    descriptionAr: f.descriptionAr || null,
    departments: f.departments || []
  }));

  // Transform Degree Programs
  const degreePrograms = (raw.programs || []).map(p => ({
    facultyName: p.facultyName,
    data: {
      slug: generateSlug(`${p.degreeType}-${p.nameEn}-${slug}`),
      nameEn: p.nameEn,
      nameAr: p.nameAr || p.nameEn,
      degreeType: p.degreeType || "Bachelor's Degree",
      durationYears: p.durationYears || 4,
      studyLanguage: "English",
      tuitionEgpPerYear: parseTuition(p.tuitionEgpPerYear),
      tuitionUsdPerYear: parseTuition(p.tuitionUsdPerYear),
    }
  }));

  return {
    slug,
    universityData,
    faculties,
    degreePrograms,
    accreditations: [] // Expandable later
  };
}
