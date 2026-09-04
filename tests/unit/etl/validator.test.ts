import { describe, it, expect } from "vitest";
import * as path from "path";
import { ExcelWorkbookParser } from "../../../src/server/etl/ExcelWorkbookParser";
import { BilingualEnrichmentProvider } from "../../../src/server/etl/BilingualEnrichmentProvider";
import { CatalogValidator, slugify, getArabicFacultyName } from "../../../src/server/etl/CatalogValidator";

describe("BilingualEnrichmentProvider", () => {
  const provider = new BilingualEnrichmentProvider();

  it("should contain metadata for all 43 institutions", () => {
    const all = provider.getAllEnrichments();
    expect(all.size).toBe(43);
  });

  it("should retrieve valid enrichment for AUC", () => {
    const auc = provider.getEnrichment("AUC", "The American University in Cairo");
    expect(auc.nameAr).toBe("الجامعة الأمريكية بالقاهرة");
    expect(auc.governorate).toBe("Cairo");
    expect(auc.type).toBe("PRIVATE");
    expect(auc.educationModel).toBe("AMERICAN");
  });

  it("should retrieve valid enrichment for ASNU (National)", () => {
    const asnu = provider.getEnrichment("ASNU", "Assiut National University");
    expect(asnu.nameAr).toBe("جامعة أسيوط الأهلية");
    expect(asnu.governorate).toBe("Assiut");
    expect(asnu.type).toBe("NATIONAL");
  });
});

describe("CatalogValidator", () => {
  const parser = new ExcelWorkbookParser();
  const provider = new BilingualEnrichmentProvider();
  const validator = new CatalogValidator();

  const file1 = path.join(process.cwd(), "src/data/Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx");
  const file2 = path.join(process.cwd(), "src/data/Ahleya_Universities_Cleaned_and_Organized.xlsx");

  it("should validate and aggregate both workbooks with zero referential errors", () => {
    const wb1 = parser.parseWorkbook(file1);
    const wb2 = parser.parseWorkbook(file2);

    const report = validator.validate([wb1, wb2], provider);

    expect(report.success).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.stats.universitiesCount).toBe(43);
    expect(report.stats.facultiesCount).toBe(381);
    expect(report.stats.programsCount).toBe(1448);
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
