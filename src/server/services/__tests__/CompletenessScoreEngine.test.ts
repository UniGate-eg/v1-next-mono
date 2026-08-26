import { describe, it, expect } from "vitest";
import { CompletenessScoreEngine } from "../CompletenessScoreEngine";

describe("CompletenessScoreEngine", () => {
  it("calculates 0 for an empty profile", () => {
    const score = CompletenessScoreEngine.calculateScore({});
    expect(score).toBe(0);
  });

  it("calculates 100 for a fully populated university profile", () => {
    const fullUniversity = {
      nameEn: "Cairo University",
      nameAr: "جامعة القاهرة",
      overviewEn: "Cairo University is a premier public university in Giza, Egypt. It was founded on 21 December 1908 and is one of the oldest modern institutions of higher education in the Middle East.",
      overviewAr: "جامعة القاهرة هي جامعة حكومية عريقة في الجيزة بمصر تأسست في 21 ديسمبر 1908 وتعد من أقدم وأعرق الجامعات ومؤسسات التعليم العالي الحديث في مصر والعالم العربي.",
      logoUrl: "https://example.com/logo.png",
      website: "https://cu.edu.eg",
      governorate: "Giza",
      established: 1908,
      phones: ["+20235676105"],
      emails: ["info@cu.edu.eg"],
      faculties: [{ id: "f1", nameEn: "Faculty of Engineering" }],
      degreePrograms: [
        { id: "p1", nameEn: "B.Sc. Computer Engineering", tuitionEgpPerYear: 15000, tuitionUsdPerYear: null }
      ],
      accreditations: [{ id: "a1", name: "NAQAAE" }],
    };

    const score = CompletenessScoreEngine.calculateScore(fullUniversity);
    expect(score).toBe(100);
  });

  it("calculates partial score accurately based on weighted checkpoints", () => {
    const partialUni = {
      nameEn: "Ain Shams University",
      nameAr: "جامعة عين شمس",
      overviewEn: "Short overview", // < 100 chars (0 pts)
      overviewAr: "نبذة قصيرة", // < 100 chars (0 pts)
      logoUrl: "https://example.com/asu.png", // 8 pts
      website: "https://asu.edu.eg", // 5 pts
      governorate: "Cairo", // 5 pts
      established: 1950, // 5 pts
      phones: [],
      emails: [],
      faculties: [],
      degreePrograms: [],
      accreditations: [],
    };

    // 8 (nameEn) + 8 (nameAr) + 8 (logoUrl) + 5 (website) + 5 (governorate) + 5 (established) = 39
    const score = CompletenessScoreEngine.calculateScore(partialUni);
    expect(score).toBe(39);
  });

  it("correctly identifies stale profiles older than 6 months", () => {
    const staleDate = new Date();
    staleDate.setMonth(staleDate.getMonth() - 7);
    expect(CompletenessScoreEngine.isStale(staleDate)).toBe(true);

    const freshDate = new Date();
    freshDate.setMonth(freshDate.getMonth() - 2);
    expect(CompletenessScoreEngine.isStale(freshDate)).toBe(false);
  });
});
