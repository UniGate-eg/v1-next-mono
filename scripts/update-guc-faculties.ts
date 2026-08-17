import { primary } from "../src/lib/prisma";
import { SearchIndexService } from "../src/server/services/SearchIndexService";

async function main() {
  console.log("Updating German University in Cairo faculties...");

  const guc = await primary.university.findUnique({
    where: { slug: "german-university-in-cairo" },
  });

  if (!guc) {
    console.error("GUC not found in database!");
    return;
  }

  // Delete existing faculties and programs for GUC
  await primary.degreeProgram.deleteMany({ where: { universityId: guc.id } });
  await primary.faculty.deleteMany({ where: { universityId: guc.id } });

  const gucFaculties = [
    {
      nameEn: "Faculty of Information Engineering and Technology (IET)",
      nameAr: "كلية هندسة وتكنولوجيا المعلومات (IET)",
      deanName: "Prof. Dr. Hani Amin",
      descriptionEn: "Offers premier German-standard programs in communications, electronics, and network engineering.",
      descriptionAr: "تقدم برامج رائدة بالمعايير الألمانية في هندسة الاتصالات، الإلكترونيات، وهندسة الشبكات.",
      departments: ["Networks Engineering", "Communications Engineering", "Electronics Engineering"],
      programs: [
        { nameEn: "B.Sc. in Networks Engineering", nameAr: "بكالوريوس هندسة الشبكات", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
        { nameEn: "B.Sc. in Communications Engineering", nameAr: "بكالوريوس هندسة الاتصالات", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
        { nameEn: "B.Sc. in Electronics Engineering", nameAr: "بكالوريوس هندسة الإلكترونيات", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
      ],
    },
    {
      nameEn: "Faculty of Media Engineering and Technology (MET)",
      nameAr: "كلية هندسة وتكنولوجيا الإعلام (MET)",
      deanName: "Prof. Dr. Slim Abdennadher",
      descriptionEn: "Focuses on computer science, software engineering, and digital media technologies.",
      descriptionAr: "تركز على علوم وهندسة الحاسب وتطوير البرمجيات وتكنولوجيا الوسائط الرقمية.",
      departments: ["Computer Science & Engineering", "Digital Media Engineering & Technology"],
      programs: [
        { nameEn: "B.Sc. in Computer Science & Engineering", nameAr: "بكالوريوس علوم وهندسة الحاسب", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
        { nameEn: "B.Sc. in Digital Media Engineering", nameAr: "بكالوريوس هندسة الوسائط الرقمية", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
      ],
    },
    {
      nameEn: "Faculty of Engineering and Materials Science (EMS)",
      nameAr: "كلية الهندسة وعلوم المواد (EMS)",
      deanName: "Prof. Dr. Ashraf El-Bayoumi",
      descriptionEn: "Offers accredited civil, architecture, mechatronics, and design & production engineering programs.",
      descriptionAr: "تقدم برامج معتمدة في الهندسة المدنية، العمارة، الميكاترونكس، والتصميم والإنتاج.",
      departments: ["Civil Engineering", "Architecture and Urban Design", "Materials Engineering", "Mechatronics Engineering", "Design and Production Engineering"],
      programs: [
        { nameEn: "B.Sc. in Civil Engineering", nameAr: "بكالوريوس الهندسة المدنية", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
        { nameEn: "B.Sc. in Architecture & Urban Design", nameAr: "بكالوريوس العمارة والتصميم العمراني", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 125000 },
        { nameEn: "B.Sc. in Materials Engineering", nameAr: "بكالوريوس هندسة المواد", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
        { nameEn: "B.Sc. in Mechatronics Engineering", nameAr: "بكالوريوس هندسة الميكاترونكس", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
        { nameEn: "B.Sc. in Design and Production Engineering", nameAr: "بكالوريوس هندسة التصميم والإنتاج", degreeType: "B.Sc.", durationYears: 5, tuitionEgpPerYear: 120000 },
      ],
    },
    {
      nameEn: "Faculty of Management Technology",
      nameAr: "كلية تكنولوجيا الإدارة",
      deanName: "Prof. Dr. Sherwat Elwan",
      descriptionEn: "Provides comprehensive business administration, informatics, and finance education.",
      descriptionAr: "تقدم تعليماً شاملاً في إدارة الأعمال، نظم المعلومات الإدارية، والمالية والمحاسبة.",
      departments: ["General Management", "Business Informatics", "Technology-based Management", "Marketing", "Finance & Accounting", "Strategic Management"],
      programs: [
        { nameEn: "B.Sc. in Business Informatics", nameAr: "بكالوريوس معلوماتية الأعمال", degreeType: "B.Sc.", durationYears: 4, tuitionEgpPerYear: 110000 },
        { nameEn: "B.Sc. in General Management", nameAr: "بكالوريوس الإدارة العامة", degreeType: "B.Sc.", durationYears: 4, tuitionEgpPerYear: 110000 },
        { nameEn: "B.Sc. in Marketing", nameAr: "بكالوريوس التسويق", degreeType: "B.Sc.", durationYears: 4, tuitionEgpPerYear: 110000 },
        { nameEn: "B.Sc. in Finance & Accounting", nameAr: "بكالوريوس المالية والمحاسبة", degreeType: "B.Sc.", durationYears: 4, tuitionEgpPerYear: 110000 },
      ],
    },
    {
      nameEn: "Faculty of Pharmacy and Biotechnology",
      nameAr: "كلية الصيدلة والتكنولوجيا الحيوية",
      deanName: "Prof. Dr. Mohamed El-Azizi",
      descriptionEn: "Offers clinical pharmacy and advanced biotechnology research programs.",
      descriptionAr: "تقدم برامج الصيدلة الإكلينيكية وأبحاث التكنولوجيا الحيوية المتقدمة.",
      departments: ["PharmD Clinical Pharmacy", "Biotechnology Program", "Pharmaceutical Chemistry"],
      programs: [
        { nameEn: "PharmD in Clinical Pharmacy", nameAr: "دكتور صيدلي (PharmD)", degreeType: "PharmD", durationYears: 6, tuitionEgpPerYear: 130000 },
        { nameEn: "B.Sc. in Biotechnology", nameAr: "بكالوريوس التكنولوجيا الحيوية", degreeType: "B.Sc.", durationYears: 4, tuitionEgpPerYear: 120000 },
      ],
    },
    {
      nameEn: "Faculty of Applied Sciences and Arts",
      nameAr: "كلية العلوم والفنون التطبيقية",
      deanName: "Prof. Dr. Sabine Schiller",
      descriptionEn: "Combines creative design disciplines including graphic, media, and product design.",
      descriptionAr: "تجمع بين تخصصات التصميم الإبداعي مثل الجرافيك، تصميم الوسائط، وتصميم المنتجات.",
      departments: ["Graphic Design", "Media Design", "Product Design"],
      programs: [
        { nameEn: "B.Sc. in Graphic Design", nameAr: "بكالوريوس تصميم الجرافيك", degreeType: "B.Sc.", durationYears: 4, tuitionEgpPerYear: 115000 },
        { nameEn: "B.Sc. in Media Design", nameAr: "بكالوريوس تصميم الوسائط", degreeType: "B.Sc.", durationYears: 4, tuitionEgpPerYear: 115000 },
        { nameEn: "B.Sc. in Product Design", nameAr: "بكالوريوس تصميم المنتجات", degreeType: "B.Sc.", durationYears: 4, tuitionEgpPerYear: 115000 },
      ],
    },
    {
      nameEn: "Faculty of Law and Legal Studies",
      nameAr: "كلية الحقوق والدراسات القانونية",
      deanName: "Prof. Dr. Michael Traest",
      descriptionEn: "Provides comparative legal studies with an emphasis on international and commercial law.",
      descriptionAr: "تقدم دراسات قانونية مقارنة مع التركيز على القانون الدولي والتجاري.",
      departments: ["Comparative Law", "International Commercial Law", "Legal Studies"],
      programs: [
        { nameEn: "LL.B. in Comparative Law & Legal Studies", nameAr: "ليسانس الحقوق والدراسات القانونية المقارنة", degreeType: "LL.B.", durationYears: 4, tuitionEgpPerYear: 100000 },
      ],
    },
    {
      nameEn: "Faculty of Postgraduate Studies and Scientific Research",
      nameAr: "كلية الدراسات العليا والبحث العلمي",
      deanName: "Prof. Dr. Hoda Mostafa",
      descriptionEn: "Supervises Master's, MBA, and Ph.D. degree programs in collaboration with German partner universities.",
      descriptionAr: "تشرف على برامج الماجستير والماجستير المهني والدكتوراه بالتعاون مع الجامعات الألمانية الشريكة.",
      departments: ["Master of Business Administration (MBA)", "M.Sc. in Computer Science", "M.Sc. in Engineering", "Ph.D. Programs"],
      programs: [
        { nameEn: "Master of Business Administration (MBA)", nameAr: "ماجستير إدارة الأعمال (MBA)", degreeType: "MBA", durationYears: 2, tuitionEgpPerYear: 140000 },
        { nameEn: "M.Sc. in Computer Science", nameAr: "ماجستير علوم الحاسب", degreeType: "M.Sc.", durationYears: 2, tuitionEgpPerYear: 130000 },
        { nameEn: "Ph.D. in Engineering & Sciences", nameAr: "دكتوراه في الهندسة والعلوم", degreeType: "Ph.D.", durationYears: 3, tuitionEgpPerYear: 150000 },
      ],
    },
  ];

  for (const fac of gucFaculties) {
    const createdFaculty = await primary.faculty.create({
      data: {
        universityId: guc.id,
        nameEn: fac.nameEn,
        nameAr: fac.nameAr,
        deanName: fac.deanName,
        descriptionEn: fac.descriptionEn,
        descriptionAr: fac.descriptionAr,
        departments: fac.departments,
      },
    });

    for (const prog of fac.programs) {
      const progSlug = `guc-${prog.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
      await primary.degreeProgram.create({
        data: {
          universityId: guc.id,
          facultyId: createdFaculty.id,
          slug: progSlug,
          nameEn: prog.nameEn,
          nameAr: prog.nameAr,
          degreeType: prog.degreeType,
          durationYears: prog.durationYears,
          tuitionEgpPerYear: prog.tuitionEgpPerYear,
          studyLanguage: "English",
        },
      });
    }
  }

  console.log("✅ Successfully inserted all 8 GUC faculties and programs!");

  // Regenerate index
  await SearchIndexService.generateIndex();
  console.log("✅ Search index updated!");
}

main()
  .catch(console.error)
  .finally(() => primary.$disconnect());
