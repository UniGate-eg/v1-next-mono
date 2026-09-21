import type { SlimSearchToken } from "@/types/university.types";
import type { IMatchSource } from "@/lib/majors/interfaces/IMatchSource";
import type {
  IMajorMatchEngine,
  ScoredUniversity,
} from "@/lib/majors/interfaces/IMajorMatchEngine";
import type { MajorDefinition } from "@/lib/majors/MajorDefinitions";

/**
 * MajorMatchEngine
 *
 * Aggregates multiple IMatchSource implementations using the Strategy pattern
 * to produce a normalized confidence score for each university/major pair.
 *
 * Sorting:
 *   1. Primary: Match Confidence Score (e.g. university matching both degree programs AND departments).
 *   2. Secondary: Institutional Prestige & Tier (QS/THE rankings, accreditation status, structured data completeness).
 *   3. Tertiary: Alphabetical order by name.
 */
export class MajorMatchEngine implements IMajorMatchEngine {
  private readonly maxPossibleScore: number;
  private corpusCache = new Map<string, string>();
  private prestigeCache = new Map<string, number>();
  private keywordCache = new WeakMap<MajorDefinition, string[]>();

  constructor(private readonly sources: IMatchSource[]) {
    if (sources.length === 0) {
      throw new Error("MajorMatchEngine requires at least one IMatchSource.");
    }
    this.maxPossibleScore = sources.reduce((sum, s) => sum + s.weight, 0);
  }

  score(university: SlimSearchToken, major: MajorDefinition): ScoredUniversity {
    let rawScore = 0;
    const matchedSources: string[] = [];

    // Cache lowercased keywords safely using a WeakMap
    let lowerKeywords = this.keywordCache.get(major);
    if (!lowerKeywords) {
      lowerKeywords = major.keywords.map((kw) => kw.toLowerCase());
      this.keywordCache.set(major, lowerKeywords);
    }

    for (const source of this.sources) {
      const cacheKey = `${source.sourceName}_${university.id}`;
      let corpus = this.corpusCache.get(cacheKey);

      if (corpus === undefined) {
        const tokens = source.extractTokens(university);
        corpus = tokens.join(" ");
        this.corpusCache.set(cacheKey, corpus);
      }

      if (!corpus) continue;

      const matched = lowerKeywords.some((kw) => corpus!.includes(kw));

      if (matched) {
        rawScore += source.weight;
        matchedSources.push(source.sourceName);
      }
    }

    return {
      university,
      score: rawScore / this.maxPossibleScore,
      matchedSources,
    };
  }

  private calculatePrestigeScore(u: SlimSearchToken): number {
    let prestige = this.prestigeCache.get(u.id);
    if (prestige !== undefined) return prestige;

    prestige = 0;
    if (u.qsRanking && u.qsRanking !== "N/A") prestige += 3;
    if (u.theRanking && u.theRanking !== "N/A") prestige += 2;
    if (u.featured) prestige += 2;
    if (Array.isArray(u.structured_faculties) && u.structured_faculties.length > 0) prestige += 1;
    if (Array.isArray(u.degreePrograms) && u.degreePrograms.length > 0) prestige += 1;

    this.prestigeCache.set(u.id, prestige);
    return prestige;
  }

  getMatches(
    universities: SlimSearchToken[],
    major: MajorDefinition,
    minScore = 0.01,
  ): ScoredUniversity[] {
    return universities
      .map((u) => this.score(u, major))
      .filter((r) => r.score >= minScore)
      .sort((a, b) => {
        // Primary: Match confidence score
        if (Math.abs(b.score - a.score) > 0.05) {
          return b.score - a.score;
        }
        // Secondary: Prestige & Institution Ranking / Completeness
        const prestigeB = this.calculatePrestigeScore(b.university);
        const prestigeA = this.calculatePrestigeScore(a.university);
        if (prestigeB !== prestigeA) {
          return prestigeB - prestigeA;
        }
        // Tertiary: Alphabetical
        const nameA = a.university.nameEn || "";
        const nameB = b.university.nameEn || "";
        return nameA.localeCompare(nameB);
      });
  }
}
