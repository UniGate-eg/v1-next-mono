import { describe, it, expect } from "vitest";
import * as path from "path";
import { ExcelWorkbookParser } from "../../../src/server/etl/ExcelWorkbookParser";

describe("ExcelWorkbookParser", () => {
  const parser = new ExcelWorkbookParser();
  const file1 = path.join(process.cwd(), "src/data/Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx");
  const file2 = path.join(process.cwd(), "src/data/Ahleya_Universities_Cleaned_and_Organized.xlsx");

  it("should successfully parse File 1 (Combined Private & International)", () => {
    const data = parser.parseWorkbook(file1);
    expect(data.universities.length).toBe(24);
    expect(data.academicUnits.length).toBe(209);
    expect(data.academicOfferings.length).toBe(1021);
    expect(data.canonicalPrograms.length).toBe(678);
    expect(data.sources.length).toBe(25);
  });

  it("should successfully parse File 2 (Ahleya National)", () => {
    const data = parser.parseWorkbook(file2);
    expect(data.universities.length).toBe(19);
    expect(data.academicUnits.length).toBe(172);
    expect(data.academicOfferings.length).toBe(427);
    expect(data.canonicalPrograms.length).toBe(300);
    expect(data.sources.length).toBe(19);
  });

  it("should throw error if file does not exist", () => {
    expect(() => parser.parseWorkbook("non-existent-file.xlsx")).toThrow();
  });
});
