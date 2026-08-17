import { EducationModel, UniversityType, PublishStatus } from "@prisma/client";

export interface UniversityDTO {
  id: string;
  slug: string;
  shortName: string | null;
  emoji: string | null;
  nameEn: string;
  nameAr: string;
  educationModel: EducationModel | string;
  type: UniversityType | string;
  governorate: string;
  city: string | null;
  addressEn: string | null;
  addressAr: string | null;
  overviewEn: string | null;
  overviewAr: string | null;
  website: string | null;
  logoUrl: string | null;
  established: number | null;
  qsRanking: string | null;
  theRanking: string | null;
  phones: string[];
  emails: string[];
  socialLinks: Record<string, string> | null;
  strengthsEn: string[];
  strengthsAr: string[];
  publishStatus: PublishStatus | string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  faculties?: FacultyDTO[];
  degreePrograms?: DegreeProgramDTO[];
  accreditations?: AccreditationDTO[];
}

export interface FacultyDTO {
  id: string;
  universityId: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  deanName: string | null;
  departments: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  degreePrograms?: DegreeProgramDTO[];
}

export interface DegreeProgramDTO {
  id: string;
  slug: string;
  universityId: string;
  facultyId: string | null;
  nameEn: string;
  nameAr: string;
  degreeType: string;
  durationYears: number;
  studyLanguage: string;
  tuitionEgpPerYear: number | null;
  tuitionUsdPerYear: number | null;
  careerOpportunities: string[];
  dualDegreePartner: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccreditationDTO {
  id: string;
  universityId: string;
  name: string;
  fullName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlimSearchToken {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  shortName?: string | null;
  type: string;
  emoji?: string | null;
  modelEmoji?: string | null;
  city?: string | null;
  governorate?: string | null;
  educationModel: string;
  established?: number | null;
  overviewEn?: string | null;
  overviewAr?: string | null;
  description?: string | null;
  description_ar?: string | null;
  qsRanking?: string | null;
  theRanking?: string | null;
  tuition?: string | null;
  tuition_ar?: string | null;
  strengthsEn?: string[];
  strengthsAr?: string[];
  faculties?: string[];
  faculties_ar?: string[];
  structured_faculties?: any[];
  degreePrograms?: any[];
  website?: string | null;
  phones?: string[];
  emails?: string[];
  socialLinks?: Record<string, string> | null;
  accentGradient?: string | null;
  featured?: boolean;
}

export interface UniversityFilters {
  governorate?: string;
  educationModel?: string;
  type?: string;
  degreeType?: string;
}
