import { describe, it, expect } from "vitest";
import { UniversityMapper } from "@/server/mappers/UniversityMapper";

describe("UniversityMapper", () => {
  const sampleRawUni = {
    id: "uni-guc",
    slug: "german-university-in-cairo",
    shortName: "GUC",
    emoji: "🇩🇪",
    nameEn: "German University in Cairo",
    nameAr: "الجامعة الألمانية بالقاهرة",
    educationModel: "GERMAN",
    type: "PRIVATE",
    governorate: "Cairo",
    city: "New Cairo",
    addressEn: "Tagamoa El Khames",
    addressAr: "التجمع الخامس",
    overviewEn: "German standard university in Egypt.",
    overviewAr: "جامعة بمعايير ألمانية في مصر.",
    website: "https://guc.edu.eg",
    logoUrl: "https://guc.edu.eg/logo.png",
    established: 2002,
    qsRanking: "Top 1000",
    theRanking: null,
    phones: ["+201234567890"],
    emails: ["info@guc.edu.eg"],
    socialLinks: { facebook: "https://facebook.com/guc" },
    strengthsEn: ["Engineering", "Applied Arts"],
    strengthsAr: ["الهندسة", "الفنون التطبيقية"],
    publishStatus: "PUBLISHED",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    faculties: [
      {
        id: "fac-eng",
        universityId: "uni-guc",
        nameEn: "Faculty of Engineering",
        nameAr: "كلية الهندسة",
        deanName: "Dr. Schmidt",
        descriptionEn: "Engineering excellence",
        descriptionAr: "التميز الهندسي",
        departments: ["Computer Engineering", "Mechatronics"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    degreePrograms: [
      {
        id: "prog-cs",
        universityId: "uni-guc",
        facultyId: "fac-eng",
        slug: "cs-bachelor",
        nameEn: "B.Sc. in Computer Science",
        nameAr: "بكالوريوس علوم الحاسب",
        degreeType: "BACHELORS",
        durationYears: 4,
        tuitionEgpPerYear: 180000,
        tuitionUsdPerYear: null,
        studyLanguage: "ENGLISH",
        careerOpportunities: ["Software Engineer", "AI Specialist"],
        dualDegreePartner: "Ulm University",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    accreditations: [
      {
        id: "acc-1",
        universityId: "uni-guc",
        name: "ZEvA",
        fullName: "Central Evaluation and Accreditation Agency",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  it("should correctly map a university record to UniversityDTO", () => {
    const dto = UniversityMapper.toDTO(sampleRawUni);

    expect(dto.id).toBe("uni-guc");
    expect(dto.slug).toBe("german-university-in-cairo");
    expect(dto.nameEn).toBe("German University in Cairo");
    expect(dto.educationModel).toBe("GERMAN");
    expect(dto.type).toBe("PRIVATE");
    expect(dto.faculties).toHaveLength(1);
    expect(dto.faculties?.[0].nameEn).toBe("Faculty of Engineering");
    expect(dto.degreePrograms).toHaveLength(1);
    expect(dto.degreePrograms?.[0].tuitionEgpPerYear).toBe(180000);
    expect(dto.accreditations).toHaveLength(1);
    expect(dto.accreditations?.[0].name).toBe("ZEvA");
  });

  it("should correctly generate a SlimSearchToken", () => {
    const token = UniversityMapper.toSlimSearchToken(sampleRawUni);

    expect(token).toEqual({
      id: "uni-guc",
      slug: "german-university-in-cairo",
      nameEn: "German University in Cairo",
      nameAr: "الجامعة الألمانية بالقاهرة",
      type: "PRIVATE",
      emoji: "🇩🇪",
      city: "New Cairo",
      educationModel: "GERMAN",
    });
  });
});
