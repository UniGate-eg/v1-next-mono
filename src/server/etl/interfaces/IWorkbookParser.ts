export interface RawUniversityRow {
  universityId: string;
  universityName: string;
  shortName: string;
  website?: string;
  notes?: string;
  certainty?: string;
}

export interface RawAcademicUnitRow {
  academicUnitId: string;
  universityId: string;
  academicUnitName: string;
  unitType?: string;
  notes?: string;
  programInsertionStatus?: string;
}

export interface RawAcademicOfferingRow {
  offeringId: string;
  academicUnitId: string;
  officialName: string;
  offeringType?: string;
  confidence?: string;
  active?: string;
  notes?: string;
  dualDegree?: string;
}

export interface RawCanonicalProgramRow {
  canonicalProgramId: string;
  canonicalProgramName: string;
  parentFieldId?: string;
}

export interface RawAcademicFieldRow {
  fieldId: string;
  fieldName: string;
}

export interface RawOfferingProgramMappingRow {
  offeringId: string;
  canonicalProgramId: string;
  relationship?: string;
}

export interface RawSourceRow {
  sourceId: string;
  universityId: string;
  sourceName: string;
  sourceType?: string;
  url?: string;
  dateAccessed?: string;
}

export interface ParsedWorkbookData {
  sourceFile: string;
  universities: RawUniversityRow[];
  academicUnits: RawAcademicUnitRow[];
  academicOfferings: RawAcademicOfferingRow[];
  canonicalPrograms: RawCanonicalProgramRow[];
  academicFields: RawAcademicFieldRow[];
  offeringProgramMappings: RawOfferingProgramMappingRow[];
  sources: RawSourceRow[];
}

export interface IWorkbookParser {
  parseWorkbook(filePath: string): ParsedWorkbookData;
}
