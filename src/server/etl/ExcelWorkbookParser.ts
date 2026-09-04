import * as fs from "fs";
import * as xlsx from "xlsx";
import {
  IWorkbookParser,
  ParsedWorkbookData,
  RawUniversityRow,
  RawAcademicUnitRow,
  RawAcademicOfferingRow,
  RawCanonicalProgramRow,
  RawAcademicFieldRow,
  RawOfferingProgramMappingRow,
  RawSourceRow
} from "./interfaces/IWorkbookParser";

export class ExcelWorkbookParser implements IWorkbookParser {
  parseWorkbook(filePath: string): ParsedWorkbookData {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Workbook file not found at path: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const wb = xlsx.read(fileBuffer, { type: "buffer" });

    // 1. Universities
    const uniSheet = wb.Sheets["Universities"];
    const rawUnis: any[] = uniSheet ? xlsx.utils.sheet_to_json(uniSheet) : [];
    const universities: RawUniversityRow[] = rawUnis.map((r) => ({
      universityId: String(r["University ID"] || "").trim(),
      universityName: String(r["University Name"] || "").trim(),
      shortName: String(r["Short Name"] || "").trim(),
      website: r["Official Website"] || r["Website"] ? String(r["Official Website"] || r["Website"]).trim() : undefined,
      notes: r["Notes"] ? String(r["Notes"]).trim() : undefined,
      certainty: r["Certainty"] ? String(r["Certainty"]).trim() : undefined
    })).filter((u) => u.universityId.length > 0 || u.universityName.length > 0);

    // 2. Academic Units (Faculties)
    const unitSheet = wb.Sheets["Academic_Units"];
    const rawUnits: any[] = unitSheet ? xlsx.utils.sheet_to_json(unitSheet) : [];
    const academicUnits: RawAcademicUnitRow[] = rawUnits.map((r) => ({
      academicUnitId: String(r["Academic Unit ID"] || "").trim(),
      universityId: String(r["University ID"] || "").trim(),
      academicUnitName: String(r["Academic Unit Name"] || "").trim(),
      unitType: r["Unit Type"] ? String(r["Unit Type"]).trim() : undefined,
      notes: r["Notes"] ? String(r["Notes"]).trim() : undefined,
      programInsertionStatus: r["Program Insertion Status"] ? String(r["Program Insertion Status"]).trim() : undefined
    })).filter((u) => u.academicUnitId.length > 0 && u.academicUnitName.length > 0);

    // 3. Academic Offerings (Degree Programs)
    const offeringSheet = wb.Sheets["Academic_Offerings"];
    const rawOfferings: any[] = offeringSheet ? xlsx.utils.sheet_to_json(offeringSheet) : [];
    const academicOfferings: RawAcademicOfferingRow[] = rawOfferings.map((r) => ({
      offeringId: String(r["Offering ID"] || "").trim(),
      academicUnitId: String(r["Academic Unit ID"] || "").trim(),
      officialName: String(r["Official Name"] || "").trim(),
      offeringType: r["Offering Type"] ? String(r["Offering Type"]).trim() : undefined,
      confidence: r["Confidence"] ? String(r["Confidence"]).trim() : undefined,
      active: r["Active"] ? String(r["Active"]).trim() : undefined,
      notes: r["Notes"] ? String(r["Notes"]).trim() : undefined,
      dualDegree: r["Dual Degree"] ? String(r["Dual Degree"]).trim() : undefined
    })).filter((o) => o.officialName.length > 0 && o.academicUnitId.length > 0);

    // 4. Canonical Programs
    const cpSheet = wb.Sheets["Canonical_Programs"];
    const rawCp: any[] = cpSheet ? xlsx.utils.sheet_to_json(cpSheet) : [];
    const canonicalPrograms: RawCanonicalProgramRow[] = rawCp.map((r) => ({
      canonicalProgramId: String(r["Canonical Program ID"] || "").trim(),
      canonicalProgramName: String(r["Canonical Program Name"] || "").trim(),
      parentFieldId: r["Parent Field ID"] ? String(r["Parent Field ID"]).trim() : undefined
    })).filter((cp) => cp.canonicalProgramId.length > 0);

    // 5. Academic Fields
    const fieldSheet = wb.Sheets["Academic_Fields"];
    const rawFields: any[] = fieldSheet ? xlsx.utils.sheet_to_json(fieldSheet) : [];
    const academicFields: RawAcademicFieldRow[] = rawFields.map((r) => ({
      fieldId: String(r["Field ID"] || "").trim(),
      fieldName: String(r["Field Name"] || "").trim()
    })).filter((f) => f.fieldId.length > 0);

    // 6. Offering Program Mappings
    const mapSheet = wb.Sheets["Offering_Program_Mapping"];
    const rawMaps: any[] = mapSheet ? xlsx.utils.sheet_to_json(mapSheet) : [];
    const offeringProgramMappings: RawOfferingProgramMappingRow[] = rawMaps.map((r) => ({
      offeringId: String(r["Offering ID"] || "").trim(),
      canonicalProgramId: String(r["Canonical Program ID"] || "").trim(),
      relationship: r["Relationship"] ? String(r["Relationship"]).trim() : undefined
    })).filter((m) => m.offeringId.length > 0);

    // 7. Sources
    const srcSheet = wb.Sheets["Sources"];
    const rawSrc: any[] = srcSheet ? xlsx.utils.sheet_to_json(srcSheet) : [];
    const sources: RawSourceRow[] = rawSrc.map((r) => ({
      sourceId: String(r["Source ID"] || "").trim(),
      universityId: String(r["University ID"] || "").trim(),
      sourceName: String(r["Source Name"] || "").trim(),
      sourceType: r["Source Type"] ? String(r["Source Type"]).trim() : undefined,
      url: r["URL"] ? String(r["URL"]).trim() : undefined,
      dateAccessed: r["Date Accessed"] ? String(r["Date Accessed"]).trim() : undefined
    })).filter((s) => s.sourceId.length > 0);

    return {
      sourceFile: filePath,
      universities,
      academicUnits,
      academicOfferings,
      canonicalPrograms,
      academicFields,
      offeringProgramMappings,
      sources
    };
  }
}
