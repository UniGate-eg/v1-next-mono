import { describe, it, expect } from "vitest";
import {
  UNIVERSITY_TYPES,
  UNIVERSITY_TYPE_META,
  isUniversityType,
  getUniversityTypeLabel,
  parseUniversityType,
  normalizeTypeParam,
  toTypeParam,
  countByType,
  type UniversityType,
  type Lang,
} from "../../src/lib/university-type";

describe("University Type Module", () => {
  describe("Guarantees G1–G6", () => {
    it("G1: getUniversityTypeLabel is non-null for all types in both languages", () => {
      const languages: Lang[] = ["en", "ar"];
      for (const type of UNIVERSITY_TYPES) {
        for (const lang of languages) {
          const label = getUniversityTypeLabel(type, lang);
          expect(label).toBeTruthy();
          expect(typeof label).toBe("string");
        }
      }
    });

    it("G2: parseUniversityType never returns ok:true when conflicting types are present", () => {
      const conflictingInputs = [
        "Public and Private Institution",
        "National - International Campus",
        "خاص وحكومي",
      ];
      for (const input of conflictingInputs) {
        const result = parseUniversityType(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.reason).toBe("AMBIGUOUS");
          expect(result.candidates.length).toBeGreaterThan(1);
        }
      }
    });

    it("G3: token 'international' never contributes to NATIONAL, and vice versa", () => {
      const intlResult = parseUniversityType("International");
      expect(intlResult).toEqual({ ok: true, type: "INTERNATIONAL" });

      const natResult = parseUniversityType("National");
      expect(natResult).toEqual({ ok: true, type: "NATIONAL" });
    });

    it("G4: normalizeTypeParam never throws and returns [] for empty/null/all-unknown", () => {
      expect(normalizeTypeParam(null)).toEqual([]);
      expect(normalizeTypeParam(undefined)).toEqual([]);
      expect(normalizeTypeParam("")).toEqual([]);
      expect(normalizeTypeParam("   ")).toEqual([]);
      expect(normalizeTypeParam("UNKNOWN,FOOBAR")).toEqual([]);
    });

    it("G5: normalizeTypeParam(toTypeParam(x)) deep-equals x for ordered duplicate-free arrays", () => {
      const testCases: UniversityType[][] = [
        [],
        ["PUBLIC"],
        ["NATIONAL"],
        ["PUBLIC", "PRIVATE"],
        ["PUBLIC", "PRIVATE", "NATIONAL", "INTERNATIONAL"],
      ];

      for (const tc of testCases) {
        const serialized = toTypeParam(tc);
        const deserialized = normalizeTypeParam(serialized);
        expect(deserialized).toEqual(tc);
      }
    });

    it("G6: functions are pure and deterministic", () => {
      const raw = "International Branch";
      const res1 = parseUniversityType(raw);
      const res2 = parseUniversityType(raw);
      expect(res1).toEqual(res2);
    });
  });

  describe("Parse Fixtures (SC-003 reference set 1–25)", () => {
    const parseCases: Array<{
      id: number;
      input: string | null | undefined;
      expected: ReturnType<typeof parseUniversityType>;
    }> = [
      { id: 1, input: "International Branch", expected: { ok: true, type: "INTERNATIONAL" } },
      { id: 2, input: "INTERNATIONAL", expected: { ok: true, type: "INTERNATIONAL" } },
      { id: 3, input: "National", expected: { ok: true, type: "NATIONAL" } },
      { id: 4, input: "Private, Non-profit", expected: { ok: true, type: "PRIVATE" } },
      { id: 5, input: "Private (non-profit)", expected: { ok: true, type: "PRIVATE" } },
      { id: 6, input: "Private Institute", expected: { ok: true, type: "PRIVATE" } },
      { id: 7, input: "Public Research", expected: { ok: true, type: "PUBLIC" } },
      { id: 8, input: "Public Institute", expected: { ok: true, type: "PUBLIC" } },
      { id: 9, input: "Governmental", expected: { ok: true, type: "PUBLIC" } },
      { id: 10, input: "جامعة أهلية", expected: { ok: true, type: "NATIONAL" } },
      { id: 11, input: "جامعة اهلية", expected: { ok: true, type: "NATIONAL" } },
      { id: 12, input: "أهلي", expected: { ok: true, type: "NATIONAL" } },
      { id: 13, input: "خاصة", expected: { ok: true, type: "PRIVATE" } },
      { id: 14, input: "معهد خاص", expected: { ok: true, type: "PRIVATE" } },
      { id: 15, input: "جامعة حكومية", expected: { ok: true, type: "PUBLIC" } },
      { id: 16, input: "دولية", expected: { ok: true, type: "INTERNATIONAL" } },
      { id: 17, input: "branch campus", expected: { ok: true, type: "INTERNATIONAL" } },
      { id: 18, input: "Ahleya", expected: { ok: true, type: "NATIONAL" } },
      { id: 19, input: "  private  ", expected: { ok: true, type: "PRIVATE" } },
      { id: 20, input: "", expected: { ok: false, reason: "EMPTY", candidates: [] } },
      { id: 21, input: "Technological", expected: { ok: false, reason: "UNRECOGNISED", candidates: [] } },
      { id: 22, input: "Non-profit", expected: { ok: false, reason: "UNRECOGNISED", candidates: [] } },
      { id: 23, input: "N/A", expected: { ok: false, reason: "UNRECOGNISED", candidates: [] } },
      {
        id: 24,
        input: "Public-Private Partnership",
        expected: { ok: false, reason: "AMBIGUOUS", candidates: ["PUBLIC", "PRIVATE"] },
      },
      {
        id: 25,
        input: "National / International",
        expected: { ok: false, reason: "AMBIGUOUS", candidates: ["NATIONAL", "INTERNATIONAL"] },
      },
    ];

    for (const { id, input, expected } of parseCases) {
      it(`Fixture #${id}: "${input}"`, () => {
        expect(parseUniversityType(input)).toEqual(expected);
      });
    }

    it("Handles null and undefined as EMPTY", () => {
      expect(parseUniversityType(null)).toEqual({ ok: false, reason: "EMPTY", candidates: [] });
      expect(parseUniversityType(undefined)).toEqual({ ok: false, reason: "EMPTY", candidates: [] });
    });
  });

  describe("normalizeTypeParam Fixtures", () => {
    const normCases: Array<{ input: string | null | undefined; expected: UniversityType[] }> = [
      { input: "PRIVATE", expected: ["PRIVATE"] },
      { input: "private", expected: ["PRIVATE"] },
      { input: "National", expected: ["NATIONAL"] },
      { input: "أهلية", expected: ["NATIONAL"] },
      { input: "NATIONAL,PUBLIC", expected: ["PUBLIC", "NATIONAL"] },
      { input: "PRIVATE,private", expected: ["PRIVATE"] },
      { input: "TECHNOLOGICAL", expected: [] },
      { input: "PRIVATE,TECHNOLOGICAL", expected: ["PRIVATE"] },
      { input: null, expected: [] },
    ];

    for (const { input, expected } of normCases) {
      it(`normalizes "${input}" to ${JSON.stringify(expected)}`, () => {
        expect(normalizeTypeParam(input)).toEqual(expected);
      });
    }
  });

  describe("toTypeParam", () => {
    it("serializes types in fixed display order without duplicates", () => {
      expect(toTypeParam(["NATIONAL"])).toBe("NATIONAL");
      expect(toTypeParam(["PRIVATE", "PUBLIC"])).toBe("PUBLIC,PRIVATE");
      expect(toTypeParam(["INTERNATIONAL", "NATIONAL", "PRIVATE", "PUBLIC"])).toBe(
        "PUBLIC,PRIVATE,NATIONAL,INTERNATIONAL"
      );
      expect(toTypeParam([])).toBe("");
    });
  });

  describe("countByType", () => {
    it("aggregates counts and filters zero-count types in display order", () => {
      const sample = [
        { type: "PRIVATE" },
        { type: "PRIVATE" },
        { type: "NATIONAL" },
        { type: "UNKNOWN" },
        { type: null },
      ];

      const counts = countByType(sample);
      expect(counts).toEqual([
        { type: "PRIVATE", count: 2 },
        { type: "NATIONAL", count: 1 },
      ]);
    });
  });

  describe("Type guard and meta", () => {
    it("isUniversityType works accurately", () => {
      expect(isUniversityType("PUBLIC")).toBe(true);
      expect(isUniversityType("PRIVATE")).toBe(true);
      expect(isUniversityType("NATIONAL")).toBe(true);
      expect(isUniversityType("INTERNATIONAL")).toBe(true);
      expect(isUniversityType("TECHNOLOGICAL")).toBe(false);
      expect(isUniversityType("SPECIALIZED")).toBe(false);
      expect(isUniversityType("")).toBe(false);
      expect(isUniversityType(null)).toBe(false);
    });

    it("getUniversityTypeLabel returns null for invalid input and never echoes raw input", () => {
      expect(getUniversityTypeLabel("TECHNOLOGICAL", "en")).toBeNull();
      expect(getUniversityTypeLabel("SPECIALIZED", "ar")).toBeNull();
      expect(getUniversityTypeLabel(123, "en")).toBeNull();
    });
  });
});
