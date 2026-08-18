import type { SlimSearchToken } from "@/types/university.types";
import type { IMatchSource } from "@/lib/majors/interfaces/IMatchSource";

/**
 * DegreeProgramMatchSource
 *
 * Extracts academic tokens exclusively from the university's degree program names.
 * This is the highest-weight source because a named degree program is the
 * strongest possible proof that a university offers a given major.
 *
 * Weight: 10 (highest)
 *
 * Examples of tokens extracted:
 *   "b.sc. computer science and artificial intelligence"
 *   "bachelor of pharmacy"
 *   "بكالوريوس هندسة الحاسبات والبرمجيات"
 *
 * EXCLUDED (by design): overviewEn, description, marketing copy.
 */
export class DegreeProgramMatchSource implements IMatchSource {
  readonly weight = 10;
  readonly sourceName = "DegreeProgramMatchSource";

  extractTokens(u: SlimSearchToken): string[] {
    const tokens: string[] = [];
    const programs = u.degreePrograms;

    if (!Array.isArray(programs)) return tokens;

    for (const p of programs) {
      if (!p || typeof p !== "object") continue;
      if (typeof p.nameEn === "string" && p.nameEn.trim()) {
        tokens.push(p.nameEn.toLowerCase().trim());
      }
      if (typeof p.nameAr === "string" && p.nameAr.trim()) {
        tokens.push(p.nameAr.toLowerCase().trim());
      }
    }

    return tokens;
  }
}
