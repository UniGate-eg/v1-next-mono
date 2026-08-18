import type { SlimSearchToken } from "@/types/university.types";
import type { IMatchSource } from "@/lib/majors/interfaces/IMatchSource";

/**
 * AcademicEntityMatchSource
 *
 * Extracts academic tokens from faculty names, faculty descriptions, and
 * nested department names. Faculty and department names are authoritative
 * academic structural metadata — safe to match against.
 *
 * Weight: 7 (secondary — broad but structural)
 *
 * Examples of tokens extracted:
 *   "faculty of computers and artificial intelligence"         (faculties[])
 *   "faculty of pharmacy"                                      (faculties[])
 *   "faculty of media engineering and technology"              (structured_faculties[].nameEn)
 *   "department of computer science"                           (structured_faculties[].departments[])
 *   "department of psychology"                                 (structured_faculties[].departments[])
 *   "كلية الحاسبات والذكاء الاصطناعي"                         (faculties_ar[])
 *
 * EXCLUDED (by design):
 *   - overviewEn / overviewAr  → prose marketing paragraphs
 *   - description / description_ar → general institution prose
 *   - strengthsEn / strengthsAr → editorial tags (too broad: "Engineering", "Technology")
 *   - nameEn / nameAr → university names (e.g. "Cairo University" would match "cairo"
 *     from any keyword containing "cairo" even if unrelated to the major)
 */
export class AcademicEntityMatchSource implements IMatchSource {
  readonly weight = 7;
  readonly sourceName = "AcademicEntityMatchSource";

  extractTokens(u: SlimSearchToken): string[] {
    const tokens: string[] = [];

    // Flat English faculty name strings
    const faculties = u.faculties;
    if (Array.isArray(faculties)) {
      for (const f of faculties) {
        if (typeof f === "string" && f.trim()) {
          tokens.push(f.toLowerCase().trim());
        }
      }
    }

    // Flat Arabic faculty name strings
    const faculties_ar = u.faculties_ar;
    if (Array.isArray(faculties_ar)) {
      for (const f of faculties_ar) {
        if (typeof f === "string" && f.trim()) {
          tokens.push(f.toLowerCase().trim());
        }
      }
    }

    // Structured faculties with nested departments
    const structuredFaculties = u.structured_faculties;
    if (Array.isArray(structuredFaculties)) {
      for (const sf of structuredFaculties) {
        if (!sf || typeof sf !== "object") continue;

        // Faculty name — structural, reliable
        if (typeof sf.nameEn === "string" && sf.nameEn.trim()) {
          tokens.push(sf.nameEn.toLowerCase().trim());
        }
        if (typeof sf.nameAr === "string" && sf.nameAr.trim()) {
          tokens.push(sf.nameAr.toLowerCase().trim());
        }

        // Department names — most specific structural signal inside faculties
        const departments = sf.departments;
        if (Array.isArray(departments)) {
          for (const dept of departments) {
            if (typeof dept === "string" && dept.trim()) {
              tokens.push(dept.toLowerCase().trim());
            }
          }
        }
      }
    }

    return tokens;
  }
}
