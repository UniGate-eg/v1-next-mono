import { UniversityType, EducationModel } from "@prisma/client";

export interface UniversityEnrichmentRecord {
  shortName: string;
  nameEn: string;
  nameAr: string;
  governorate: string;
  city?: string;
  type: UniversityType;
  educationModel: EducationModel;
  website?: string;
  established?: number;
  overviewEn?: string;
  overviewAr?: string;
  phones?: string[];
  emails?: string[];
}

export interface IEnrichmentProvider {
  getEnrichment(shortName: string, nameEn: string): UniversityEnrichmentRecord;
  getAllEnrichments(): Map<string, UniversityEnrichmentRecord>;
}
