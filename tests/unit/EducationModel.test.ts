import { describe, it, expect } from "vitest";
import {
  EDUCATION_MODELS,
  EDUCATION_MODEL_META,
  isEducationModel,
  getEducationModelLabel,
  getEducationModelIcon,
  countByEducationModel,
  type Lang,
} from "../../src/lib/education-model";

describe("Education Model Module", () => {
  it("declares exactly the 6 models from the Prisma enum, in display order", () => {
    expect(EDUCATION_MODELS).toEqual(["AMERICAN", "GERMAN", "BRITISH", "EGYPTIAN", "FRENCH", "CANADIAN"]);
  });

  it("getEducationModelLabel is non-null and non-empty for every model in both languages", () => {
    const languages: Lang[] = ["en", "ar"];
    for (const model of EDUCATION_MODELS) {
      for (const lang of languages) {
        const label = getEducationModelLabel(model, lang);
        expect(label).toBeTruthy();
        expect(typeof label).toBe("string");
      }
    }
  });

  it("getEducationModelIcon is non-null for every model", () => {
    for (const model of EDUCATION_MODELS) {
      expect(getEducationModelIcon(model)).toBeTruthy();
    }
  });

  it("every model has a distinct icon", () => {
    const icons = EDUCATION_MODELS.map((m) => EDUCATION_MODEL_META[m].icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("isEducationModel accepts only the 6 valid enum values", () => {
    for (const model of EDUCATION_MODELS) {
      expect(isEducationModel(model)).toBe(true);
    }
    for (const bad of ["TECHNOLOGICAL", "american", "", null, undefined, 42, {}]) {
      expect(isEducationModel(bad)).toBe(false);
    }
  });

  it("getEducationModelLabel/getEducationModelIcon return null and never echo raw input for invalid values", () => {
    expect(getEducationModelLabel("NOT_A_MODEL", "en")).toBeNull();
    expect(getEducationModelLabel("NOT_A_MODEL", "ar")).toBeNull();
    expect(getEducationModelIcon("NOT_A_MODEL")).toBeNull();
    expect(getEducationModelLabel(null, "en")).toBeNull();
    expect(getEducationModelLabel(undefined, "en")).toBeNull();
  });

  describe("countByEducationModel", () => {
    it("aggregates counts and filters zero-count models, in display order", () => {
      const items = [
        { educationModel: "EGYPTIAN" },
        { educationModel: "EGYPTIAN" },
        { educationModel: "FRENCH" },
        { educationModel: "CANADIAN" },
        { educationModel: "UNKNOWN" },
        { educationModel: null },
      ];
      const result = countByEducationModel(items);
      expect(result).toEqual([
        { model: "EGYPTIAN", count: 2 },
        { model: "FRENCH", count: 1 },
        { model: "CANADIAN", count: 1 },
      ]);
    });

    it("returns an empty array for an empty or all-invalid list", () => {
      expect(countByEducationModel([])).toEqual([]);
      expect(countByEducationModel([{ educationModel: "X" }, { educationModel: null }])).toEqual([]);
    });
  });
});
