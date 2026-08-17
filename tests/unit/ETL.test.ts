import { describe, it, expect } from "vitest";
import { generateSlug, parseTuition, transformUniversity } from "../../prisma/etl/transform";
import { validateUniversityData } from "../../prisma/etl/validate";

describe("ETL Pipeline Utilities", () => {
  describe("generateSlug", () => {
    it("should generate a clean url slug from text", () => {
      expect(generateSlug("Cairo University")).toBe("cairo-university");
      expect(generateSlug("German University in Cairo (GUC)!")).toBe("german-university-in-cairo-guc");
      expect(generateSlug("  Ain Shams University  ")).toBe("ain-shams-university");
    });
  });

  describe("parseTuition", () => {
    it("should extract numerical values from tuition string formats", () => {
      expect(parseTuition("120,000 EGP / year")).toBe(120000);
      expect(parseTuition("$15,000")).toBe(15000);
      expect(parseTuition("Approx. 85000 EGP")).toBe(85000);
      expect(parseTuition(undefined)).toBeNull();
      expect(parseTuition("Free / Government subsidized")).toBeNull();
    });
  });

  describe("validateUniversityData", () => {
    it("should successfully validate complete raw university records", () => {
      const validRecord = {
        nameEn: "Badr University in Cairo",
        nameAr: "جامعة بدر بالقاهرة",
        type: "PRIVATE",
        governorate: "Cairo",
        city: "Badr City",
        established: 2014,
        faculties: [
          {
            nameEn: "Faculty of Pharmacy",
            nameAr: "كلية الصيدلة",
            deanName: "Dr. Ahmed",
          },
        ],
        programs: [
          {
            nameEn: "Pharm D",
            degreeType: "BACHELORS",
            tuitionEgpPerYear: "95,000 EGP",
          },
        ],
      };

      const validation = validateUniversityData(validRecord);
      expect(validation.success).toBe(true);
    });

    it("should reject invalid records missing required fields", () => {
      const invalidRecord = {
        nameEn: "Incomplete University",
        // missing nameAr, type, governorate
      };

      const validation = validateUniversityData(invalidRecord);
      expect(validation.success).toBe(false);
    });
  });

  describe("transformUniversity", () => {
    it("should correctly transform raw data into relational structures", () => {
      const raw = {
        nameEn: "Future University in Egypt",
        nameAr: "جامعة المستقبل",
        type: "PRIVATE",
        governorate: "Cairo",
        city: "New Cairo",
        faculties: [
          {
            nameEn: "Faculty of Engineering",
            nameAr: "كلية الهندسة",
            departments: ["Architecture", "Mechatronics"],
          },
        ],
        programs: [
          {
            nameEn: "Architectural Engineering",
            nameAr: "هندسة العمارة",
            facultyName: "Faculty of Engineering",
            degreeType: "BACHELORS",
            tuitionEgpPerYear: "140,000 EGP",
          },
        ],
      };

      const transformed = transformUniversity(raw as any);

      expect(transformed.slug).toBe("future-university-in-egypt");
      expect(transformed.universityData.nameEn).toBe("Future University in Egypt");
      expect(transformed.faculties).toHaveLength(1);
      expect(transformed.faculties[0].nameEn).toBe("Faculty of Engineering");
      expect(transformed.degreePrograms).toHaveLength(1);
      expect(transformed.degreePrograms[0].data.tuitionEgpPerYear).toBe(140000);
    });
  });
});
