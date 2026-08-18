import { describe, it, expect } from "vitest";
import { MAJOR_DEFINITIONS, type MajorDefinition } from "@/lib/majors/MajorDefinitions";

// These common words are too generic to be in academic keywords.
// If they appear alone (no spaces), they contaminate prose matching.
const BANNED_STANDALONE_WORDS = [
  "arts", "systems", "technology", "engineering", "science", "production",
  "management", "information", "computing", "design", "business",
  // Arabic standalone generics
  "معلومات", "طب", "هندسة", "علوم", "إدارة", "تقنية", "فنون",
];

describe("MajorDefinitions — keyword hygiene", () => {
  it("exports MAJOR_DEFINITIONS as a non-empty array", () => {
    expect(Array.isArray(MAJOR_DEFINITIONS)).toBe(true);
    expect(MAJOR_DEFINITIONS.length).toBeGreaterThan(0);
  });

  it("every major has a unique id", () => {
    const ids = MAJOR_DEFINITIONS.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(MAJOR_DEFINITIONS.length);
  });

  it("every major has required fields: id, name, name_ar, icon, color, keywords", () => {
    for (const major of MAJOR_DEFINITIONS) {
      expect(major.id, `id missing for ${major.name}`).toBeTruthy();
      expect(major.name, `name missing for id=${major.id}`).toBeTruthy();
      expect(major.name_ar, `name_ar missing for id=${major.id}`).toBeTruthy();
      expect(major.icon, `icon missing for id=${major.id}`).toBeTruthy();
      expect(major.color, `color missing for id=${major.id}`).toBeTruthy();
      expect(Array.isArray(major.keywords), `keywords not array for id=${major.id}`).toBe(true);
    }
  });

  it("every major has at least 5 keywords", () => {
    for (const major of MAJOR_DEFINITIONS) {
      expect(
        major.keywords.length,
        `Major "${major.id}" has fewer than 5 keywords`,
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it("no keyword is a banned standalone generic word (would contaminate prose matching)", () => {
    for (const major of MAJOR_DEFINITIONS) {
      for (const kw of major.keywords) {
        const trimmed = kw.trim().toLowerCase();
        for (const banned of BANNED_STANDALONE_WORDS) {
          // A keyword IS the banned word exactly (no spaces = standalone)
          if (!trimmed.includes(" ") && !trimmed.includes("_")) {
            expect(
              trimmed,
              `Major "${major.id}" has banned standalone keyword: "${kw}"`,
            ).not.toBe(banned);
          }
        }
      }
    }
  });

  it("all keywords are lowercase (normalization consistency)", () => {
    for (const major of MAJOR_DEFINITIONS) {
      for (const kw of major.keywords) {
        expect(
          kw,
          `Major "${major.id}" has non-lowercase keyword: "${kw}"`,
        ).toBe(kw.toLowerCase());
      }
    }
  });

  it("no keyword has leading or trailing whitespace", () => {
    for (const major of MAJOR_DEFINITIONS) {
      for (const kw of major.keywords) {
        expect(
          kw,
          `Major "${major.id}" has whitespace-padded keyword: "${kw}"`,
        ).toBe(kw.trim());
      }
    }
  });

  it("no duplicate keywords WITHIN a single major", () => {
    for (const major of MAJOR_DEFINITIONS) {
      const seen = new Set<string>();
      for (const kw of major.keywords) {
        expect(
          seen.has(kw),
          `Major "${major.id}" has duplicate keyword: "${kw}"`,
        ).toBe(false);
        seen.add(kw);
      }
    }
  });

  it("no two DIFFERENT majors share an identical keyword", () => {
    const keywordToMajor = new Map<string, string>();
    for (const major of MAJOR_DEFINITIONS) {
      for (const kw of major.keywords) {
        if (keywordToMajor.has(kw)) {
          // Allow if it's a different major — this is the test
          const prevMajorId = keywordToMajor.get(kw)!;
          expect(
            prevMajorId,
            `Keyword "${kw}" is shared between major "${prevMajorId}" and "${major.id}"`,
          ).toBe(major.id);
        } else {
          keywordToMajor.set(kw, major.id);
        }
      }
    }
  });

  describe("coverage: specific majors must have specific keywords", () => {
    const findMajor = (id: string): MajorDefinition => {
      const m = MAJOR_DEFINITIONS.find((def) => def.id === id);
      if (!m) throw new Error(`Major "${id}" not found`);
      return m;
    };

    it("CS major includes 'computer science' and 'faculty of computers'", () => {
      const cs = findMajor("cs");
      expect(cs.keywords).toContain("computer science");
      expect(cs.keywords).toContain("faculty of computers");
    });

    it("Psychology major includes 'department of psychology'", () => {
      const psych = findMajor("psychology");
      expect(psych.keywords).toContain("department of psychology");
    });

    it("Mechanical Engineering major includes 'mechanical engineering' and 'department of mechanical engineering'", () => {
      const mech = findMajor("mechanical-eng");
      expect(mech.keywords).toContain("mechanical engineering");
      expect(mech.keywords).toContain("department of mechanical engineering");
    });

    it("Media Engineering major includes 'faculty of media engineering and technology'", () => {
      const media = findMajor("media-eng");
      expect(media.keywords).toContain("faculty of media engineering and technology");
    });

    it("Pharmacy major includes 'faculty of pharmacy' and 'clinical pharmacy'", () => {
      const pharma = findMajor("pharmacy");
      expect(pharma.keywords).toContain("faculty of pharmacy");
      expect(pharma.keywords).toContain("clinical pharmacy");
    });
  });
});
