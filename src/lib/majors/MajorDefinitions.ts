/**
 * MajorDefinitions.ts — Single Source of Truth
 *
 * All major definitions live here. Keywords are EXCLUSIVELY academic-entity
 * compound phrases: degree program names, faculty names, and department names.
 *
 * Keyword hygiene rules (enforced by unit tests in MajorDefinitions.test.ts):
 *   1. No standalone word shorter than 8 chars with no spaces.
 *      ❌ "computer", "arts", "طب", "معلومات"
 *      ✓  "computer science", "faculty of arts", "كلية طب"
 *   2. Every keyword must appear in the context of an academic structural entity.
 *      ❌ "engineering" (matches "engineering services" in every overview)
 *      ✓  "faculty of engineering", "department of mechanical engineering"
 *   3. No two distinct majors share an identical keyword to prevent double-counting.
 *
 * When adding a new major:
 *   - Run `pnpm test` to validate keyword hygiene.
 *   - Ensure Arabic keywords mirror the exact Arabic text in structured_faculties
 *     or degreePrograms fields from the database.
 */

export interface MajorDefinition {
  id: string;
  name: string;
  name_ar: string;
  icon: string;
  color: string;
  /**
   * Compound academic phrases matched against faculty names, department names,
   * and degree program names ONLY. Never matched against prose descriptions.
   */
  keywords: string[];
}

export const MAJOR_DEFINITIONS: MajorDefinition[] = [
  {
    id: "cs",
    name: "Computer Science & Software Engineering",
    name_ar: "علوم وهندسة الحاسب والبرمجيات",
    icon: "💻",
    color: "#E11D48",
    keywords: [
      // Degree program names
      "computer science",
      "software engineering",
      "computer engineering",
      "information systems",
      "computing and information",
      "computer and information",
      "network engineering",
      "cybersecurity",
      "information security",
      // Faculty / Department names
      "faculty of computers",
      "faculty of computing",
      "faculty of information technology",
      "school of computing",
      "school of information technology",
      "department of computer",
      "department of software",
      "department of information systems",
      "department of networks",
      "department of cybersecurity",
      // Arabic equivalents
      "علوم الحاسب",
      "هندسة الحاسبات",
      "هندسة البرمجيات",
      "نظم المعلومات",
      "كلية الحاسبات",
      "كلية الحاسب",
      "كلية تكنولوجيا المعلومات",
      "قسم علوم الحاسب",
      "قسم الحاسبات",
    ],
  },

  {
    id: "ai",
    name: "Artificial Intelligence & Data Science",
    name_ar: "الذكاء الاصطناعي وعلوم البيانات",
    icon: "🤖",
    color: "#99582a",
    keywords: [
      // Degree program names
      "artificial intelligence",
      "data science",
      "machine learning",
      "intelligent systems",
      "smart systems",
      "data engineering",
      "computer science and ai",
      "computer science and artificial intelligence",
      // Department / Faculty names
      "department of artificial intelligence",
      "department of data science",
      "department of machine learning",
      "school of artificial intelligence",
      // Arabic equivalents
      "الذكاء الاصطناعي",
      "علوم البيانات",
      "تعلم الآلة",
      "الأنظمة الذكية",
      "قسم الذكاء الاصطناعي",
    ],
  },

  {
    id: "industrial-eng",
    name: "Industrial & Systems Engineering",
    name_ar: "الهندسة الصناعية وهندسة النظم",
    icon: "🏭",
    color: "#bb9457",
    keywords: [
      // Degree program names
      "industrial engineering",
      "systems engineering",
      "manufacturing engineering",
      "industrial and systems engineering",
      "production and industrial engineering",
      // Department / Faculty names
      "department of industrial engineering",
      "department of systems engineering",
      "department of manufacturing",
      "faculty of industrial engineering",
      // Arabic equivalents
      "الهندسة الصناعية",
      "هندسة الإنتاج والتصميم",
      "هندسة النظم",
      "قسم الهندسة الصناعية",
    ],
  },

  {
    id: "business",
    name: "Business Administration & Commerce",
    name_ar: "إدارة الأعمال والتجارة والمحاسبة",
    icon: "📊",
    color: "#ffe6a7",
    keywords: [
      // Degree program names
      "business administration",
      "business and economics",
      "management and economics",
      "international business",
      "marketing management",
      "supply chain management",
      "human resources management",
      "accounting and auditing",
      "financial management",
      // Faculty / Department names
      "faculty of business",
      "faculty of management",
      "faculty of commerce",
      "school of business",
      "school of management",
      "department of business",
      "department of management",
      "department of accounting",
      "department of marketing",
      "department of finance",
      // Arabic equivalents
      "إدارة الأعمال",
      "كلية إدارة الأعمال",
      "كلية التجارة",
      "كلية الإدارة",
      "قسم إدارة الأعمال",
      "قسم المحاسبة",
      "قسم التسويق",
    ],
  },

  {
    id: "pharmacy",
    name: "Pharmacy & Clinical Pharmacy",
    name_ar: "الصيدلة والصيدلة الإكلينيكية",
    icon: "💊",
    color: "#E11D48",
    keywords: [
      // Degree program names
      "pharmacy",
      "clinical pharmacy",
      "pharmaceutical sciences",
      "pharmd",
      "doctor of pharmacy",
      // Faculty / Department names
      "faculty of pharmacy",
      "school of pharmacy",
      "department of pharmacy",
      "department of pharmaceutical",
      // Arabic equivalents
      "الصيدلة",
      "كلية الصيدلة",
      "الصيدلة الإكلينيكية",
      "الصيدلانية",
      "قسم الصيدلة",
    ],
  },

  {
    id: "architectural-eng",
    name: "Architectural Engineering & Urban Design",
    name_ar: "الهندسة المعمارية والتصميم العمراني",
    icon: "🏗️",
    color: "#99582a",
    keywords: [
      // Degree program names
      "architectural engineering",
      "architecture",
      "urban design",
      "urban planning",
      "interior architecture",
      "landscape architecture",
      // Faculty / Department names
      "faculty of architecture",
      "faculty of engineering and architecture",
      "school of architecture",
      "department of architecture",
      "department of architectural engineering",
      "department of urban design",
      "department of urban planning",
      // Arabic equivalents
      "الهندسة المعمارية",
      "العمارة",
      "التصميم العمراني",
      "التخطيط العمراني",
      "كلية العمارة",
      "قسم الهندسة المعمارية",
    ],
  },

  {
    id: "mechatronics",
    name: "Mechatronics & Robotics Engineering",
    name_ar: "هندسة الميكاترونكس والروبوتات",
    icon: "⚙️",
    color: "#bb9457",
    keywords: [
      // Degree program names
      "mechatronics engineering",
      "mechatronics and robotics",
      "robotics engineering",
      "automation engineering",
      "embedded systems",
      "control systems engineering",
      // Department names
      "department of mechatronics",
      "department of robotics",
      "department of automation",
      "department of control systems",
      // Arabic equivalents
      "هندسة الميكاترونكس",
      "الميكاترونكس والروبوتات",
      "هندسة الروبوتات",
      "أنظمة التحكم",
      "قسم الميكاترونكس",
    ],
  },

  {
    id: "economics",
    name: "Economics & Political Economy",
    name_ar: "الاقتصاد والاقتصاد السياسي",
    icon: "📈",
    color: "#ffe6a7",
    keywords: [
      // Degree program names
      "economics",
      "political economy",
      "applied economics",
      "econometrics",
      "development economics",
      "international economics",
      // Faculty / Department names
      "faculty of economics",
      "school of economics",
      "department of economics",
      "department of econometrics",
      // Arabic equivalents
      "الاقتصاد",
      "الاقتصاد السياسي",
      "الاقتصاد التطبيقي",
      "كلية الاقتصاد",
      "قسم الاقتصاد",
    ],
  },

  {
    id: "medicine",
    name: "Medicine & Surgery (MBBCh)",
    name_ar: "الطب البشري والجراحة",
    icon: "🩺",
    color: "#E11D48",
    keywords: [
      // Degree program names
      "medicine and surgery",
      "mbbch",
      "mbbs",
      "bachelor of medicine",
      "doctor of medicine",
      "general medicine",
      "human medicine",
      // Faculty names
      "faculty of medicine",
      "school of medicine",
      "medical school",
      // Arabic equivalents
      "الطب البشري",
      "الطب والجراحة",
      "كلية الطب",
      "كلية الطب البشري",
      "طب بشري",
    ],
  },

  {
    id: "dentistry",
    name: "Dentistry & Oral Surgery",
    name_ar: "طب وجراحة الأسنان",
    icon: "🦷",
    color: "#99582a",
    keywords: [
      // Degree program names
      "dentistry",
      "dental surgery",
      "oral surgery",
      "oral medicine",
      "orthodontics",
      // Faculty names
      "faculty of dentistry",
      "school of dentistry",
      "dental school",
      "department of dentistry",
      // Arabic equivalents
      "طب الأسنان",
      "جراحة الفم والأسنان",
      "كلية طب الأسنان",
      "كلية الأسنان",
      "قسم طب الأسنان",
    ],
  },

  {
    id: "law",
    name: "Law & Legal Studies",
    name_ar: "الحقوق والدراسات القانونية",
    icon: "⚖️",
    color: "#bb9457",
    keywords: [
      // Degree program names
      "law",
      "legal studies",
      "jurisprudence",
      "international law",
      "human rights law",
      "comparative law",
      // Faculty / Department names
      "faculty of law",
      "school of law",
      "department of law",
      "department of legal studies",
      // Arabic equivalents
      "الحقوق",
      "القانون",
      "الدراسات القانونية",
      "كلية الحقوق",
      "قسم الحقوق",
    ],
  },

  {
    id: "political-science",
    name: "Political Science & International Relations",
    name_ar: "العلوم السياسية والعلاقات الدولية",
    icon: "🏛️",
    color: "#ffe6a7",
    keywords: [
      // Degree program names
      "political science",
      "international relations",
      "diplomacy",
      "public policy",
      "global affairs",
      "political economy and public policy",
      // Department names
      "department of political science",
      "department of international relations",
      "department of diplomacy",
      "school of global affairs",
      // Arabic equivalents
      "العلوم السياسية",
      "العلاقات الدولية",
      "الدبلوماسية",
      "السياسة العامة",
      "قسم العلوم السياسية",
    ],
  },

  {
    id: "journalism",
    name: "Mass Communication & Journalism",
    name_ar: "الإعلام والصحافة والاتصال الجماهيري",
    icon: "📰",
    color: "#E11D48",
    keywords: [
      // Degree program names
      "journalism",
      "mass communication",
      "broadcasting",
      "media studies",
      "public relations",
      "radio and television",
      "journalism and mass communication",
      // Faculty / Department names
      "faculty of mass communication",
      "school of journalism",
      "department of journalism",
      "department of mass communication",
      "department of broadcasting",
      // Arabic equivalents
      "الصحافة",
      "الإعلام",
      "الاتصال الجماهيري",
      "كلية الإعلام",
      "كلية الصحافة",
      "قسم الصحافة",
      "الإذاعة والتليفزيون",
    ],
  },

  {
    id: "graphic-design",
    name: "Graphic Design & Applied Arts",
    name_ar: "تصميم الجرافيك والفنون التطبيقية",
    icon: "🎨",
    color: "#99582a",
    keywords: [
      // Degree program names
      "graphic design",
      "applied arts",
      "fine arts",
      "visual arts",
      "interior design",
      "industrial design",
      "animation",
      "digital design",
      // Faculty / Department names
      "faculty of applied arts",
      "faculty of fine arts",
      "school of design",
      "department of graphic design",
      "department of applied arts",
      "department of fine arts",
      // Arabic equivalents
      "تصميم الجرافيك",
      "الفنون التطبيقية",
      "الفنون الجميلة",
      "كلية الفنون التطبيقية",
      "كلية الفنون الجميلة",
      "قسم التصميم الجرافيكي",
    ],
  },

  {
    id: "biotechnology",
    name: "Biotechnology & Life Sciences",
    name_ar: "التكنولوجيا الحيوية والعلوم البيولوجية",
    icon: "🧬",
    color: "#bb9457",
    keywords: [
      // Degree program names
      "biotechnology",
      "molecular biology",
      "genetic engineering",
      "biochemistry",
      "bioinformatics",
      "life sciences",
      "biological sciences",
      // Faculty / Department names
      "faculty of biotechnology",
      "school of life sciences",
      "department of biotechnology",
      "department of molecular biology",
      "department of biochemistry",
      "department of genetics",
      // Arabic equivalents
      "التكنولوجيا الحيوية",
      "الأحياء الجزيئية",
      "الهندسة الوراثية",
      "الكيمياء الحيوية",
      "كلية التكنولوجيا الحيوية",
      "قسم التكنولوجيا الحيوية",
    ],
  },

  {
    id: "nanotechnology",
    name: "Nanotechnology & Advanced Materials",
    name_ar: "تكنولوجيا النانو وهندسة المواد المتقدمة",
    icon: "🔬",
    color: "#ffe6a7",
    keywords: [
      // Degree program names
      "nanotechnology",
      "nanoscience",
      "advanced materials",
      "materials science",
      "materials engineering",
      "nanotechnology engineering",
      // Department names
      "department of nanotechnology",
      "department of materials science",
      "department of advanced materials",
      // Arabic equivalents
      "تكنولوجيا النانو",
      "علوم وهندسة المواد",
      "المواد المتقدمة",
      "هندسة المواد",
      "قسم تكنولوجيا النانو",
    ],
  },

  {
    id: "psychology",
    name: "Psychology & Behavioral Sciences",
    name_ar: "علم النفس والعلوم السلوكية",
    icon: "🧠",
    color: "#E11D48",
    keywords: [
      // Degree program names
      "psychology",
      "behavioral science",
      "cognitive science",
      "clinical psychology",
      "counseling psychology",
      "organizational psychology",
      // Faculty / Department names
      "department of psychology",
      "school of psychology",
      "faculty of arts and sciences", // Many psychology depts sit here
      "department of behavioral science",
      // Arabic equivalents
      "علم النفس",
      "العلوم السلوكية",
      "الإرشاد النفسي",
      "علم النفس الإكلينيكي",
      "قسم علم النفس",
      "كلية الآداب والعلوم الاجتماعية",
    ],
  },

  {
    id: "mechanical-eng",
    name: "Mechanical & Automotive Engineering",
    name_ar: "الهندسة الميكانيكية وهندسة السيارات",
    icon: "🔧",
    color: "#99582a",
    keywords: [
      // Degree program names
      "mechanical engineering",
      "automotive engineering",
      "power engineering",
      "thermal engineering",
      "production engineering and mechanical design",
      "engineering mechanics",
      "aerospace engineering",
      // Department names (note: not generic "engineering")
      "department of mechanical engineering",
      "department of mechanical design",
      "department of automotive engineering",
      "department of power engineering",
      "department of aerospace",
      // Arabic equivalents
      "الهندسة الميكانيكية",
      "هندسة السيارات",
      "هندسة القوى الميكانيكية",
      "هندسة الإنتاج والتصميم الميكانيكي",
      "قسم الهندسة الميكانيكية",
    ],
  },

  {
    id: "media-eng",
    name: "Media Engineering & Digital Media",
    name_ar: "هندسة وتكنولوجيا الوسائط الرقمية",
    icon: "🎬",
    color: "#bb9457",
    keywords: [
      // Degree program names
      "media engineering",
      "digital media",
      "multimedia",
      "game development",
      "media technology",
      "animation and visual effects",
      "interactive media",
      // Faculty / Department names
      "faculty of media engineering",
      "faculty of media engineering and technology",
      "department of media engineering",
      "department of digital media",
      "school of digital media",
      "department of multimedia",
      // Arabic equivalents
      "هندسة الإعلام",
      "الإعلام الرقمي",
      "تكنولوجيا الوسائط",
      "الوسائط المتعددة",
      "كلية هندسة الإعلام والتكنولوجيا",
      "قسم هندسة الإعلام",
    ],
  },
];
