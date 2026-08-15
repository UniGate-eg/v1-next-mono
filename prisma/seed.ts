import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/unicompass?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Egyptian Universities and Academic Majors...");

  const universitiesData = [
    {
      slug: "cairo-university",
      nameEn: "Cairo University",
      nameAr: "جامعة القاهرة",
      type: "PUBLIC" as const,
      governorate: "Giza",
      website: "https://cu.edu.eg",
      established: 1908,
      description:
        "Egypt's premier public university, founded in 1908. It includes prestigious faculties in engineering, medicine, law, commerce, and computer science.",
      majors: [
        { nameEn: "Computer Engineering & AI", nameAr: "هندسة الحاسبات والذكاء الاصطناعي", slug: "comp-eng", degree: "B.Sc.", duration: 5 },
        { nameEn: "Medicine & Surgery", nameAr: "الطب البشري والجراحة", slug: "medicine", degree: "M.B.B.Ch.", duration: 5 },
        { nameEn: "Pharmacy (PharmD)", nameAr: "الصيدلة الإكلينيكية", slug: "pharmacy", degree: "Pharm.D.", duration: 6 },
        { nameEn: "Dentistry", nameAr: "طب وجراحة الفم والأسنان", slug: "dentistry", degree: "B.D.S.", duration: 5 },
        { nameEn: "Economics & Political Science", nameAr: "الاقتصاد والعلوم السياسية", slug: "econ-pol", degree: "B.Sc.", duration: 4 },
        { nameEn: "Law", nameAr: "الحقوق", slug: "law", degree: "LL.B.", duration: 4 },
      ],
    },
    {
      slug: "ain-shams-university",
      nameEn: "Ain Shams University",
      nameAr: "جامعة عين شمس",
      type: "PUBLIC" as const,
      governorate: "Cairo",
      website: "https://www.asu.edu.eg",
      established: 1950,
      description:
        "One of Egypt's largest and most historic public universities, located in Abbassia, Cairo. Renowned for its top-ranked engineering and medical faculties.",
      majors: [
        { nameEn: "Civil Engineering", nameAr: "الهندسة المدنية", slug: "civil-eng", degree: "B.Sc.", duration: 5 },
        { nameEn: "Computer Science", nameAr: "علوم الحاسب", slug: "cs", degree: "B.Sc.", duration: 4 },
        { nameEn: "Medicine", nameAr: "الطب البشري", slug: "medicine", degree: "M.B.B.Ch.", duration: 5 },
        { nameEn: "Business Administration", nameAr: "إدارة الأعمال", slug: "business", degree: "B.B.A.", duration: 4 },
        { nameEn: "Languages (Alsun)", nameAr: "الألسن والترجمة", slug: "alsun", degree: "B.A.", duration: 4 },
      ],
    },
    {
      slug: "alexandria-university",
      nameEn: "Alexandria University",
      nameAr: "جامعة الإسكندرية",
      type: "PUBLIC" as const,
      governorate: "Alexandria",
      website: "https://alexu.edu.eg",
      established: 1938,
      description:
        "Historic Mediterranean public research university with leading programs in engineering, maritime studies, medicine, and arts.",
      majors: [
        { nameEn: "Marine Engineering & Naval Architecture", nameAr: "هندسة العمارة البحرية", slug: "marine-eng", degree: "B.Sc.", duration: 5 },
        { nameEn: "Information Technology", nameAr: "تكنولوجيا المعلومات", slug: "it", degree: "B.Sc.", duration: 4 },
        { nameEn: "Medicine & Surgery", nameAr: "الطب والجراحة", slug: "medicine", degree: "M.B.B.Ch.", duration: 5 },
        { nameEn: "Fine Arts", nameAr: "الفنون الجميلة", slug: "fine-arts", degree: "B.F.A.", duration: 5 },
      ],
    },
    {
      slug: "german-university-in-cairo",
      nameEn: "German University in Cairo (GUC)",
      nameAr: "الجامعة الألمانية بالقاهرة",
      type: "PRIVATE" as const,
      governorate: "Cairo",
      website: "https://www.guc.edu.eg",
      established: 2002,
      description:
        "Premier German-accredited private university located in New Cairo, featuring state-of-the-art labs and dual Egyptian/German degree recognition.",
      majors: [
        { nameEn: "Computer Science & Engineering", nameAr: "هندسة وعلوم الحاسب", slug: "cse", degree: "B.Sc.", duration: 5 },
        { nameEn: "Mechatronics Engineering", nameAr: "هندسة الميكاترونكس", slug: "mechatronics", degree: "B.Sc.", duration: 5 },
        { nameEn: "Pharmacy & Biotechnology", nameAr: "الصيدلة والتكنولوجيا الحيوية", slug: "pharm-biotech", degree: "B.Sc.", duration: 5 },
        { nameEn: "Management Technology", nameAr: "تكنولوجيا الإدارة", slug: "mgmt-tech", degree: "B.Sc.", duration: 4 },
        { nameEn: "Applied Arts & Design", nameAr: "الفنون التطبيقية والتصميم", slug: "applied-arts", degree: "B.A.", duration: 5 },
      ],
    },
    {
      slug: "american-university-in-cairo",
      nameEn: "The American University in Cairo (AUC)",
      nameAr: "الجامعة الأمريكية بالقاهرة",
      type: "PRIVATE" as const,
      governorate: "Cairo",
      website: "https://www.aucegypt.edu",
      established: 1919,
      description:
        "World-renowned US-accredited liberal arts university located in New Cairo, renowned for global research impact and international faculty.",
      majors: [
        { nameEn: "Computer Science", nameAr: "علوم الحاسب", slug: "cs", degree: "B.S.", duration: 4 },
        { nameEn: "Mechanical Engineering", nameAr: "الهندسة الميكانيكية", slug: "mech-eng", degree: "B.S.", duration: 5 },
        { nameEn: "Business Administration & Finance", nameAr: "إدارة الأعمال والمالية", slug: "business-finance", degree: "B.B.A.", duration: 4 },
        { nameEn: "Journalism & Mass Communication", nameAr: "الصحافة والإعلام", slug: "journalism", degree: "B.A.", duration: 4 },
        { nameEn: "Architectural Engineering", nameAr: "الهندسة المعمارية", slug: "arch-eng", degree: "B.S.", duration: 5 },
      ],
    },
    {
      slug: "galala-university",
      nameEn: "Galala University",
      nameAr: "جامعة الجلالة الأهلية",
      type: "NATIONAL" as const,
      governorate: "Suez",
      website: "https://www.gu.edu.eg",
      established: 2020,
      description:
        "Modern smart national university situated on the scenic Galala Plateau in Suez, partnering with prestigious international universities including Arizona State University (ASU).",
      majors: [
        { nameEn: "Artificial Intelligence & Data Science", nameAr: "الذكاء الاصطناعي وعلوم البيانات", slug: "ai-data-science", degree: "B.Sc.", duration: 4 },
        { nameEn: "Software Engineering (ASU Dual Program)", nameAr: "هندسة البرمجيات بالتعاون مع أريزونا", slug: "se-asu", degree: "B.S.", duration: 4 },
        { nameEn: "Dentistry", nameAr: "طب وجراحة الفم والأسنان", slug: "dentistry", degree: "B.D.S.", duration: 5 },
        { nameEn: "Physical Therapy", nameAr: "العلاج الطبيعي", slug: "physical-therapy", degree: "B.P.T.", duration: 5 },
        { nameEn: "Administrative Sciences", nameAr: "العلوم الإدارية والمالية", slug: "admin-sciences", degree: "B.Sc.", duration: 4 },
      ],
    },
    {
      slug: "alamein-international-university",
      nameEn: "Alamein International University (AIU)",
      nameAr: "جامعة العلمين الدولية الأهلية",
      type: "NATIONAL" as const,
      governorate: "Matrouh",
      website: "https://aiu.edu.eg",
      established: 2020,
      description:
        "4th Generation smart national university located in New Alamein City on the Mediterranean coast, offering cutting-edge digital programs.",
      majors: [
        { nameEn: "Biomedical Informatics", nameAr: "المعلوماتية الطبية الحيوية", slug: "biomedical-info", degree: "B.Sc.", duration: 4 },
        { nameEn: "Architecture & Environmental Design", nameAr: "العمارة والتصميم البيئي", slug: "arch-env", degree: "B.Sc.", duration: 5 },
        { nameEn: "Clinical Pharmacy", nameAr: "الصيدلة الإكلينيكية", slug: "pharm-d", degree: "Pharm.D.", duration: 6 },
        { nameEn: "Public Health", nameAr: "الصحة العامة", slug: "public-health", degree: "B.Sc.", duration: 4 },
      ],
    },
    {
      slug: "british-university-in-egypt",
      nameEn: "The British University in Egypt (BUE)",
      nameAr: "الجامعة البريطانية في مصر",
      type: "PRIVATE" as const,
      governorate: "Cairo",
      website: "https://www.bue.edu.eg",
      established: 2005,
      description:
        "Renowned private university in El Sherouk City providing UK-validated dual degrees in collaboration with London South Bank University.",
      majors: [
        { nameEn: "Informatics & Computer Science", nameAr: "الحاسبات والمعلوماتية", slug: "ics", degree: "B.Sc. (Hons)", duration: 4 },
        { nameEn: "Chemical Engineering", nameAr: "الهندسة الكيميائية", slug: "chem-eng", degree: "B.Sc. (Hons)", duration: 5 },
        { nameEn: "Dentistry", nameAr: "طب الأسنان", slug: "dentistry", degree: "B.D.S.", duration: 5 },
        { nameEn: "Business Administration", nameAr: "إدارة الأعمال", slug: "business", degree: "B.Sc.", duration: 4 },
      ],
    },
    {
      slug: "european-universities-in-egypt",
      nameEn: "European Universities in Egypt (EUE)",
      nameAr: "الجامعات الأوروبية في مصر",
      type: "INTERNATIONAL" as const,
      governorate: "Cairo",
      website: "https://eue.edu.eg",
      established: 2021,
      description:
        "International branch campus hub hosting prestigious European universities including University of London and University of Central Lancashire (UCLan) in New Administrative Capital.",
      majors: [
        { nameEn: "Computer Science (Univ. of London / LSE)", nameAr: "علوم الحاسب (جامعة لندن)", slug: "cs-uol", degree: "B.Sc. (Hons)", duration: 3 },
        { nameEn: "Law (LL.B. Univ. of London)", nameAr: "القانون الدولي (جامعة لندن)", slug: "law-uol", degree: "LL.B. (Hons)", duration: 3 },
        { nameEn: "Mechatronics & Intelligent Machines (UCLan)", nameAr: "الميكاترونكس والأنظمة الذكية", slug: "mechatronics-uclan", degree: "B.Eng.", duration: 4 },
      ],
    },
  ];

  for (const uniData of universitiesData) {
    const { majors, ...uniDetails } = uniData;

    const uni = await prisma.university.upsert({
      where: { slug: uniDetails.slug },
      update: uniDetails,
      create: uniDetails,
    });

    for (const major of majors) {
      await prisma.major.upsert({
        where: {
          slug_universityId: {
            slug: major.slug,
            universityId: uni.id,
          },
        },
        update: {
          nameEn: major.nameEn,
          nameAr: major.nameAr,
          degree: major.degree,
          duration: major.duration,
        },
        create: {
          ...major,
          universityId: uni.id,
        },
      });
    }

    console.log(`✓ Seeded ${uni.nameEn} with ${majors.length} majors`);
  }

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
