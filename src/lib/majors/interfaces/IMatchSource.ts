import type { SlimSearchToken } from "@/types/university.types";

/**
 * IMatchSource — Interface Segregation Principle
 *
 * A single academic text source that can be extracted from a SlimSearchToken
 * and weighted for scoring. Implementations are exclusively academic entities
 * (degree programs, faculties, departments) — never prose text or marketing copy.
 */
export interface IMatchSource {
  /**
   * The relative scoring weight of this source.
   * Normalized across all sources during scoring.
   *
   * Scale:
   *   - Degree program names:     10  (direct academic intent — strongest signal)
   *   - Department names:          8  (structural academic proof)
   *   - Faculty names:             5  (broader category, still structural)
   */
  readonly weight: number;

  /**
   * A unique identifier for this source, used in debug output
   * and test assertions (e.g. "DegreeProgramMatchSource").
   */
  readonly sourceName: string;

  /**
   * Extract lowercased text tokens from the given university record
   * that are relevant to this source's scope.
   *
   * MUST return an empty array — never throw — when data is absent.
   * MUST only extract academic structural entities (faculty, dept, program names).
   * MUST NOT extract prose text (overviews, descriptions, marketing copy).
   */
  extractTokens(university: SlimSearchToken): string[];
}
