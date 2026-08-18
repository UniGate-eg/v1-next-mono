import { describe, it, expect, beforeEach } from "vitest";
import { MajorMatchEngine } from "@/lib/majors/engine/MajorMatchEngine";
import { DegreeProgramMatchSource } from "@/lib/majors/engine/DegreeProgramMatchSource";
import { AcademicEntityMatchSource } from "@/lib/majors/engine/AcademicEntityMatchSource";
import { MAJOR_DEFINITIONS } from "@/lib/majors/MajorDefinitions";
import type { SlimSearchToken } from "@/types/university.types";

// ─── Test Fixtures ─────────────────────────────────────────────────────────
// Minimal SlimSearchToken stubs that mirror real DB records for key universities

const GUC: SlimSearchToken = {
  id: "guc",
  slug: "guc",
  nameEn: "German University in Cairo",
  nameAr: "الجامعة الألمانية بالقاهرة",
  type: "PRIVATE",
  educationModel: "GERMAN",
  governorate: "Cairo",
  city: "New Cairo",
  faculties: [
    "Faculty of Engineering and Materials Science",
    "Faculty of Media Engineering and Technology",
    "Faculty of Management Technology",
    "Faculty of Pharmacy and Biotechnology",
  ],
  structured_faculties: [
    {
      nameEn: "Faculty of Engineering and Materials Science",
      nameAr: "كلية الهندسة وعلوم المواد",
      departments: [
        "Department of Mechanical Engineering",
        "Department of Mechatronics Engineering",
        "Department of Computer Science and Engineering",
        "Department of Industrial Engineering",
        "Department of Applied Mathematics",
      ],
    },
    {
      nameEn: "Faculty of Media Engineering and Technology",
      nameAr: "كلية هندسة الإعلام والتكنولوجيا",
      departments: [
        "Department of Media Engineering",
        "Department of Computer Science",
        "Department of Digital Media",
      ],
    },
    {
      nameEn: "Faculty of Pharmacy and Biotechnology",
      nameAr: "كلية الصيدلة والتكنولوجيا الحيوية",
      departments: ["Department of Pharmacy", "Department of Biotechnology"],
    },
  ],
  degreePrograms: [
    { nameEn: "B.Sc. Computer Science and Engineering", nameAr: "بكالوريوس هندسة الحاسبات" },
    { nameEn: "B.Sc. Mechanical Engineering", nameAr: "بكالوريوس الهندسة الميكانيكية" },
    { nameEn: "B.Sc. Mechatronics Engineering", nameAr: "بكالوريوس هندسة الميكاترونكس" },
    { nameEn: "B.Sc. Media Engineering and Technology", nameAr: "بكالوريوس هندسة الإعلام" },
    { nameEn: "B.Pharm. Pharmacy", nameAr: "بكالوريوس الصيدلة" },
    { nameEn: "B.Sc. Industrial Engineering", nameAr: "بكالوريوس الهندسة الصناعية" },
  ],
};

const MEDICAL_ONLY: SlimSearchToken = {
  id: "medical-test",
  slug: "medical-test",
  nameEn: "Test Medical University",
  nameAr: "جامعة الطب الاختبارية",
  type: "PRIVATE",
  educationModel: "EGYPTIAN",
  governorate: "Cairo",
  city: "Cairo",
  overviewEn: "This university provides information technology systems for hospital management. Students receive comprehensive information about medical studies.",
  overviewAr: "تقدم الجامعة تكنولوجيا المعلومات لإدارة المستشفيات. يحصل الطلاب على معلومات شاملة عن الدراسة الطبية.",
  faculties: ["Faculty of Medicine", "Faculty of Dentistry"],
  structured_faculties: [
    {
      nameEn: "Faculty of Medicine",
      nameAr: "كلية الطب البشري",
      departments: ["Department of Internal Medicine", "Department of Surgery"],
    },
  ],
  degreePrograms: [
    { nameEn: "MBBCh Medicine and Surgery", nameAr: "بكالوريوس الطب والجراحة" },
  ],
};

const AUC: SlimSearchToken = {
  id: "auc",
  slug: "auc",
  nameEn: "The American University in Cairo",
  nameAr: "الجامعة الأمريكية بالقاهرة",
  type: "PRIVATE",
  educationModel: "AMERICAN",
  governorate: "Cairo",
  city: "New Cairo",
  faculties: [
    "School of Sciences and Engineering",
    "School of Business",
    "School of Humanities and Social Sciences",
    "School of Global Affairs and Public Policy",
  ],
  structured_faculties: [
    {
      nameEn: "School of Sciences and Engineering",
      nameAr: "مدرسة العلوم والهندسة",
      departments: [
        "Department of Computer Science and Engineering",
        "Department of Mechanical Engineering",
        "Department of Electronics and Communication Engineering",
        "Department of Physics",
        "Department of Mathematics",
      ],
    },
    {
      nameEn: "School of Humanities and Social Sciences",
      nameAr: "مدرسة الآداب والعلوم الاجتماعية",
      departments: [
        "Department of Psychology",
        "Department of Political Science",
        "Department of Sociology, Anthropology, Psychology, and Egyptology",
        "Department of Journalism and Mass Communication",
      ],
    },
    {
      nameEn: "School of Business",
      nameAr: "مدرسة الأعمال",
      departments: [
        "Department of Management",
        "Department of Accounting",
        "Department of Economics",
        "Department of Finance",
      ],
    },
  ],
  degreePrograms: [
    { nameEn: "B.Sc. Computer Science", nameAr: "بكالوريوس علوم الحاسب" },
    { nameEn: "B.Sc. Mechanical Engineering", nameAr: "بكالوريوس الهندسة الميكانيكية" },
    { nameEn: "B.A. Psychology", nameAr: "بكالوريوس علم النفس" },
    { nameEn: "B.A. Political Science", nameAr: "بكالوريوس العلوم السياسية" },
    { nameEn: "B.Sc. Business Administration", nameAr: "بكالوريوس إدارة الأعمال" },
  ],
};

// ─── Test Suite ────────────────────────────────────────────────────────────

describe("MajorMatchEngine", () => {
  let engine: MajorMatchEngine;

  beforeEach(() => {
    engine = new MajorMatchEngine([
      new DegreeProgramMatchSource(),
      new AcademicEntityMatchSource(),
    ]);
  });

  describe("constructor validation", () => {
    it("throws when no sources provided", () => {
      expect(() => new MajorMatchEngine([])).toThrow(
        "MajorMatchEngine requires at least one IMatchSource.",
      );
    });
  });

  describe("Computer Science major", () => {
    const csMajor = MAJOR_DEFINITIONS.find((m) => m.id === "cs")!;

    it("scores GUC > 0 (has CS department and CS degree program)", () => {
      const result = engine.score(GUC, csMajor);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores GUC at max (1.0) — matches both degree programs AND departments", () => {
      const result = engine.score(GUC, csMajor);
      expect(result.score).toBe(1.0);
    });

    it("scores AUC > 0 (has CS degree program and department)", () => {
      const result = engine.score(AUC, csMajor);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores MEDICAL_ONLY at 0 — no CS degree programs or departments", () => {
      const result = engine.score(MEDICAL_ONLY, csMajor);
      expect(result.score).toBe(0);
    });

    it("does NOT match university with 'information technology' only in overview prose", () => {
      // MEDICAL_ONLY has "information technology" in overviewEn — should NOT match
      const result = engine.score(MEDICAL_ONLY, csMajor);
      expect(result.score).toBe(0);
      expect(result.matchedSources).toHaveLength(0);
    });
  });

  describe("Mechanical Engineering major", () => {
    const mechMajor = MAJOR_DEFINITIONS.find((m) => m.id === "mechanical-eng")!;

    it("scores GUC > 0 (has Mechanical Engineering dept and degree)", () => {
      const result = engine.score(GUC, mechMajor);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores AUC > 0 (has Mechanical Engineering dept and degree)", () => {
      const result = engine.score(AUC, mechMajor);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores MEDICAL_ONLY at 0 — no mechanical engineering dept or program", () => {
      const result = engine.score(MEDICAL_ONLY, mechMajor);
      expect(result.score).toBe(0);
    });
  });

  describe("Psychology major", () => {
    const psychMajor = MAJOR_DEFINITIONS.find((m) => m.id === "psychology")!;

    it("scores AUC > 0 (has Psychology department and Psychology degree)", () => {
      const result = engine.score(AUC, psychMajor);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores GUC at 0 — no Psychology department or program", () => {
      const result = engine.score(GUC, psychMajor);
      expect(result.score).toBe(0);
    });
  });

  describe("Media Engineering major", () => {
    const mediaMajor = MAJOR_DEFINITIONS.find((m) => m.id === "media-eng")!;

    it("scores GUC > 0 (has Faculty and Department of Media Engineering)", () => {
      const result = engine.score(GUC, mediaMajor);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores MEDICAL_ONLY at 0 — no media engineering department", () => {
      const result = engine.score(MEDICAL_ONLY, mediaMajor);
      expect(result.score).toBe(0);
    });
  });

  describe("Pharmacy major", () => {
    const pharmMajor = MAJOR_DEFINITIONS.find((m) => m.id === "pharmacy")!;

    it("scores GUC > 0 (has Faculty of Pharmacy and Pharmacy degree)", () => {
      const result = engine.score(GUC, pharmMajor);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores AUC at 0 — no pharmacy faculty or program", () => {
      const result = engine.score(AUC, pharmMajor);
      expect(result.score).toBe(0);
    });
  });

  describe("Medicine major", () => {
    const medMajor = MAJOR_DEFINITIONS.find((m) => m.id === "medicine")!;

    it("scores MEDICAL_ONLY > 0 (has Faculty of Medicine and MBBCh program)", () => {
      const result = engine.score(MEDICAL_ONLY, medMajor);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores GUC at 0 — GUC has no medicine faculty or MBBCh program", () => {
      const result = engine.score(GUC, medMajor);
      expect(result.score).toBe(0);
    });
  });

  describe("score ordering (getMatches)", () => {
    const csMajor = MAJOR_DEFINITIONS.find((m) => m.id === "cs")!;

    it("returns results sorted descending by score", () => {
      const results = engine.getMatches([GUC, AUC, MEDICAL_ONLY], csMajor);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it("excludes MEDICAL_ONLY (score = 0) from CS results", () => {
      const results = engine.getMatches([GUC, AUC, MEDICAL_ONLY], csMajor);
      const slugs = results.map((r) => r.university.slug);
      expect(slugs).not.toContain("medical-test");
    });

    it("includes GUC and AUC in CS results", () => {
      const results = engine.getMatches([GUC, AUC, MEDICAL_ONLY], csMajor);
      const slugs = results.map((r) => r.university.slug);
      expect(slugs).toContain("guc");
      expect(slugs).toContain("auc");
    });

    it("university matching in BOTH degree programs AND faculties scores higher than faculty-only", () => {
      // Partial university: only has faculty name, no degree programs
      const facultyOnly: SlimSearchToken = {
        id: "faculty-only-test",
        slug: "faculty-only-test",
        nameEn: "Faculty Only Test University",
        nameAr: "جامعة اختبار",
        type: "PUBLIC",
        educationModel: "EGYPTIAN",
        governorate: "Cairo",
        city: "Cairo",
        faculties: ["Faculty of Computers and Information Technology"],
        structured_faculties: [
          {
            nameEn: "Faculty of Computers and Information Technology",
            nameAr: "كلية الحاسبات وتكنولوجيا المعلومات",
            departments: ["Department of Computer Science"],
          },
        ],
        degreePrograms: [], // No degree programs
      };

      const fullScore = engine.score(GUC, csMajor).score; // Has both
      const partialScore = engine.score(facultyOnly, csMajor).score;

      // GUC has both degree programs AND academic entities → higher score
      expect(fullScore).toBeGreaterThan(partialScore);
    });
  });
});
