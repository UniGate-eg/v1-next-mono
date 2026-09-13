import { describe, it, expect } from "vitest";
import * as path from "path";
import { ExcelWorkbookParser } from "../../../src/server/etl/ExcelWorkbookParser";
import { BilingualEnrichmentProvider } from "../../../src/server/etl/BilingualEnrichmentProvider";
import { CatalogValidator, slugify, getArabicFacultyName } from "../../../src/server/etl/CatalogValidator";
import type { ParsedWorkbookData } from "../../../src/server/etl/interfaces/IWorkbookParser";
import { UniversityType, EducationModel } from "@prisma/client";

describe("BilingualEnrichmentProvider", () => {
  const provider = new BilingualEnrichmentProvider();

  it("should contain metadata for all 43 institutions", () => {
    const all = provider.getAllEnrichments();
    expect(all.size).toBe(43);
  });

  it("should retrieve valid enrichment for AUC", () => {
    const auc = provider.getEnrichment("AUC", "The American University in Cairo");
    expect(auc).not.toBeNull();
    expect(auc!.nameAr).toBe("الجامعة الأمريكية بالقاهرة");
    expect(auc!.governorate).toBe("Cairo");
    expect(auc!.type).toBe("PRIVATE");
    expect(auc!.educationModel).toBe("AMERICAN");
  });

  it("should retrieve valid enrichment for ASNU (National)", () => {
    const asnu = provider.getEnrichment("ASNU", "Assiut National University");
    expect(asnu).not.toBeNull();
    expect(asnu!.nameAr).toBe("جامعة أسيوط الأهلية");
    expect(asnu!.governorate).toBe("Assiut");
    expect(asnu!.type).toBe("NATIONAL");
  });

  it("should return null for unknown institution", () => {
    const unknown = provider.getEnrichment("UNKNOWN_UNI", "Non-existent University");
    expect(unknown).toBeNull();
  });
});

describe("CatalogValidator", () => {
  const validator = new CatalogValidator();

  const mockWorkbook: ParsedWorkbookData = {
    sourceFile: "mock.xlsx",
    universities: [
      {
        universityId: "TEST_UNI",
        shortName: "TEST",
        universityName: "Test University",
      },
    ],
    academicUnits: [
      {
        academicUnitId: "U1",
        universityId: "TEST_UNI",
        academicUnitName: "Faculty of Engineering",
      },
    ],
    academicOfferings: [
      {
        offeringId: "O1",
        academicUnitId: "U1",
        officialName: "B.Sc. in Computer Engineering",
      },
    ],
    canonicalPrograms: [],
    academicFields: [],
    offeringProgramMappings: [],
    sources: [],
  };

  it("V1: flags NO_VERIFIED_RECORD when enrichment is missing", () => {
    const mockProvider = {
      getEnrichment: () => null,
      getAllEnrichments: () => new Map(),
    };

    const report = validator.validate([mockWorkbook], mockProvider);
    expect(report.success).toBe(false);
    expect(report.typeReview).toContainEqual(
      expect.objectContaining({
        institutionId: "TEST_UNI",
        reason: "NO_VERIFIED_RECORD",
        blocking: true,
      })
    );
  });

  it("V2: flags MISSING_SOURCE when typeSource is missing or has empty reference", () => {
    const mockProvider = {
      getEnrichment: () => ({
        shortName: "TEST",
        nameEn: "Test University",
        nameAr: "جامعة تجريبية",
        governorate: "Cairo",
        type: UniversityType.PRIVATE,
        educationModel: EducationModel.EGYPTIAN,
      }),
      getAllEnrichments: () => new Map(),
    };

    const report = validator.validate([mockWorkbook], mockProvider);
    expect(report.success).toBe(false);
    expect(report.typeReview).toContainEqual(
      expect.objectContaining({
        institutionId: "TEST_UNI",
        reason: "MISSING_SOURCE",
        blocking: true,
      })
    );
  });

  it("V3: flags RULE_VIOLATION when FOREIGN_PARENT is used for non-INTERNATIONAL type", () => {
    const mockProvider = {
      getEnrichment: () => ({
        shortName: "TEST",
        nameEn: "Test University",
        nameAr: "جامعة تجريبية",
        governorate: "Cairo",
        type: UniversityType.PRIVATE,
        typeSource: {
          authority: "FOREIGN_PARENT" as const,
          reference: "UK Royal Charter",
          verifiedOn: "2026-09-13",
        },
        educationModel: EducationModel.EGYPTIAN,
      }),
      getAllEnrichments: () => new Map(),
    };

    const report = validator.validate([mockWorkbook], mockProvider);
    expect(report.success).toBe(false);
    expect(report.typeReview).toContainEqual(
      expect.objectContaining({
        institutionId: "TEST_UNI",
        reason: "RULE_VIOLATION",
        blocking: true,
      })
    );
  });

  it("V4: flags DESCRIPTION_CONTRADICTION when overviewAr conflicts with type", () => {
    const mockProvider = {
      getEnrichment: () => ({
        shortName: "TEST",
        nameEn: "Test University",
        nameAr: "جامعة تجريبية",
        governorate: "Cairo",
        type: UniversityType.PRIVATE,
        typeSource: {
          authority: "MOHE" as const,
          reference: "Ministerial Decree 123",
          verifiedOn: "2026-09-13",
        },
        overviewAr: "أول جامعة أهلية بحثية في مصر",
        educationModel: EducationModel.EGYPTIAN,
      }),
      getAllEnrichments: () => new Map(),
    };

    const nonBlockingValidator = new CatalogValidator({ isV4Blocking: false });
    const report = nonBlockingValidator.validate([mockWorkbook], mockProvider);
    expect(report.typeReview).toContainEqual(
      expect.objectContaining({
        institutionId: "TEST_UNI",
        reason: "DESCRIPTION_CONTRADICTION",
        candidates: ["NATIONAL"],
        blocking: false,
      })
    );
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it("successfully validates valid university with typeCounts and typeSourceRef", () => {
    const mockProvider = {
      getEnrichment: () => ({
        shortName: "TEST",
        nameEn: "Test University",
        nameAr: "جامعة تجريبية",
        governorate: "Cairo",
        type: UniversityType.NATIONAL,
        typeSource: {
          authority: "MOHE" as const,
          reference: "Ministerial Decree 456",
          verifiedOn: "2026-09-13",
        },
        overviewAr: "جامعة أهلية رائدة",
        educationModel: EducationModel.EGYPTIAN,
      }),
      getAllEnrichments: () => new Map(),
    };

    const report = validator.validate([mockWorkbook], mockProvider);
    expect(report.success).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.typeCounts).toEqual({
      PUBLIC: 0,
      PRIVATE: 0,
      NATIONAL: 1,
      INTERNATIONAL: 0,
    });
    expect(report.validatedData.universities[0].typeSourceRef).toBe(
      "MOHE: Ministerial Decree 456"
    );
  });

  it("should produce deterministic slugs", () => {
    expect(slugify("Computer Science & Engineering")).toBe("computer-science-engineering");
    expect(slugify("Assiut National University")).toBe("assiut-national-university");
  });

  it("should translate common faculty names to Arabic", () => {
    expect(getArabicFacultyName("Faculty of Medicine")).toBe("كلية الطب البشري");
    expect(getArabicFacultyName("Faculty of Dentistry")).toBe("كلية طب وجراحة الفم والأسنان");
    expect(getArabicFacultyName("Faculty of Engineering")).toBe("كلية الهندسة");
  });
});
