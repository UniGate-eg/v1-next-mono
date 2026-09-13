import { UniversityType, EducationModel } from "@prisma/client";

export type TypeAuthority = "MOHE" | "SCU" | "FOREIGN_PARENT";

export interface TypeSource {
  authority: TypeAuthority;
  reference: string;
  verifiedOn: string;
}

export interface UniversityEnrichmentRecord {
  shortName: string;
  nameEn: string;
  nameAr: string;
  governorate: string;
  city?: string;
  type: UniversityType;
  typeSource?: TypeSource;
  educationModel: EducationModel;
  website?: string;
  established?: number;
  overviewEn?: string;
  overviewAr?: string;
  phones?: string[];
  emails?: string[];
}

export interface IEnrichmentProvider {
  getEnrichment(shortName: string, nameEn: string): UniversityEnrichmentRecord | null;
  getAllEnrichments(): Map<string, UniversityEnrichmentRecord>;
  /**
   * Whether a human content owner has checked every `typeSource.reference` in this
   * provider against the official MoHE/SCU registry and confirmed it. Providers that
   * don't implement this are treated as unverified (the safer default) by CatalogValidator.
   */
  isAuditHumanVerified?(): boolean;
}
