import type { SlimSearchToken } from "@/types/university.types";
import type { MajorDefinition } from "@/lib/majors/MajorDefinitions";

/**
 * A scored university result from the matching engine.
 * Score is normalized 0.0–1.0 across all registered sources.
 */
export interface ScoredUniversity {
  /** The raw university record */
  university: SlimSearchToken;
  /**
   * Normalized confidence score: 0.0 = no match, 1.0 = matched every source.
   * Values are relative — use for sorting, not for absolute thresholds.
   */
  score: number;
  /**
   * Which source classes contributed to the score.
   * Useful for debugging false positives and test assertions.
   */
  matchedSources: string[];
}

/**
 * IMajorMatchEngine — the primary contract for the matching subsystem.
 *
 * Consumers (MajorsClient, tests) depend on this interface,
 * not on the concrete MajorMatchEngine class — satisfying DIP.
 */
export interface IMajorMatchEngine {
  /**
   * Score a single university against a single major definition.
   * Always returns a ScoredUniversity (score=0 if no match).
   */
  score(university: SlimSearchToken, major: MajorDefinition): ScoredUniversity;

  /**
   * Score all universities against a major and return only those
   * above the minimum score, sorted descending by confidence.
   *
   * @param universities  Full database of slim search tokens
   * @param major         The major definition to match against
   * @param minScore      Minimum normalized score to include (default: 0.01)
   */
  getMatches(
    universities: SlimSearchToken[],
    major: MajorDefinition,
    minScore?: number,
  ): ScoredUniversity[];
}
