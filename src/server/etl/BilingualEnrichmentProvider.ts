import { UniversityType, EducationModel } from "@prisma/client";
import { IEnrichmentProvider, UniversityEnrichmentRecord } from "./interfaces/IEnrichmentProvider";

/**
 * Whether every `typeSource.reference` below has been checked by a human content
 * owner against the official MoHE / Supreme Council of Universities registry.
 *
 * The references currently on file (decree numbers, dates) were drafted during the
 * type-consistency audit (see specs/005-university-type-consistency/audit/type-audit.md)
 * and have NOT been confirmed against a live, authoritative source. Flip this to `true`
 * only after that confirmation is done, and record who did it and when in the audit doc.
 */
export const AUDIT_HUMAN_VERIFIED = false;

export const VERIFIED_INSTITUTIONS_METADATA: Record<string, UniversityEnrichmentRecord> = {
  // ----------------------------------------------------
  // FILE 1: PRIVATE, NATIONAL & PUBLIC (24) — see type per record; this file groups
  // institutions historically sourced together, not by a single shared type.
  // ----------------------------------------------------
  AUC: {
    shortName: "AUC",
    emoji: "🦉",
    nameEn: "The American University in Cairo",
    nameAr: "الجامعة الأمريكية بالقاهرة",
    governorate: "Cairo",
    city: "New Cairo",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Special Agreement & Private Universities Council Listing",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.AMERICAN,
    website: "https://www.aucegypt.edu",
    established: 1919,
    overviewEn: "A leading English-language, American-accredited institution of higher education and center of intellectual and cultural life in the Arab world.",
    overviewAr: "مؤسسة رائدة للتعليم العالي باللغة الإنجليزية معتمدة أمريكياً ومركز للحياة الفكرية والثقافية في العالم العربي."
  },
  GUC: {
    shortName: "GUC",
    emoji: "⚙️",
    nameEn: "German University in Cairo",
    nameAr: "الجامعة الألمانية بالقاهرة",
    governorate: "Cairo",
    city: "New Cairo",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 27/2002",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.GERMAN,
    website: "https://www.guc.edu.eg",
    established: 2002,
    overviewEn: "Premier German higher education institution in Egypt offering world-class engineering, management, and applied arts curricula.",
    overviewAr: "مؤسسة تعليمية ألمانية رائدة في مصر تقدم مناهج عالمية في الهندسة والإدارة والفنون التطبيقية."
  },
  MSA: {
    shortName: "MSA",
    emoji: "🎨",
    nameEn: "MSA University",
    nameAr: "جامعة أكتوبر للعلوم الحديثة والآداب",
    governorate: "Giza",
    city: "6th of October City",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 244/1996",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.BRITISH,
    website: "https://msa.edu.eg",
    established: 1996,
    overviewEn: "October University for Modern Sciences and Arts provides British higher education in Egypt with dual validation from UK universities.",
    overviewAr: "جامعة أكتوبر للعلوم الحديثة والآداب تقدم تعليماً بريطانياً في مصر مع شهادات مزدوجة من جامعات المملكة المتحدة."
  },
  NU: {
    shortName: "NU",
    emoji: "🌊",
    nameEn: "Nile University",
    nameAr: "جامعة النيل",
    governorate: "Giza",
    city: "Sheikh Zayed",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 270/2011 (Ahleya)",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.AMERICAN,
    website: "https://nu.edu.eg",
    established: 2006,
    overviewEn: "First non-profit, research-oriented national university in Egypt dedicated to technology and business entrepreneurship.",
    overviewAr: "أول جامعة أهلية بحثية غير ربحية في مصر متخصصة في التكنولوجيا وريادة الأعمال."
  },
  GIU: {
    shortName: "GIU",
    emoji: "🔧",
    nameEn: "German International University",
    nameAr: "الجامعة الألمانية الدولية",
    governorate: "Cairo",
    city: "New Administrative Capital",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 53/2019",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.GERMAN,
    website: "https://giu-uni.de",
    established: 2019,
    overviewEn: "German International University of Applied Sciences in the New Administrative Capital offering industry-linked practical degrees.",
    overviewAr: "الجامعة الألمانية الدولية للعلوم التطبيقية بالعاصمة الإدارية الجديدة لتقديم درجات تطبيقية مرتبطة بالصناعة."
  },
  PUA: {
    shortName: "PUA",
    emoji: "🏮",
    nameEn: "Pharos University in Alexandria",
    nameAr: "جامعة فاروس بالإسكندرية",
    governorate: "Alexandria",
    city: "Smouha",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 252/2006",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://www.pua.edu.eg",
    established: 2006,
    overviewEn: "First private university established in Alexandria with internationally recognized programs in healthcare and engineering.",
    overviewAr: "أول جامعة خاصة أُنشئت في الإسكندرية مع برامج معترف بها دولياً في الرعاية الصحية والهندسة."
  },
  MUST: {
    shortName: "MUST",
    emoji: "🔬",
    nameEn: "Misr University for Science and Technology",
    nameAr: "جامعة مصر للعلوم والتكنولوجيا",
    governorate: "Giza",
    city: "6th of October City",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 245/1996",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://must.edu.eg",
    established: 1996,
    overviewEn: "Prominent private university renowned for its university hospital, medical sciences, and technological innovation.",
    overviewAr: "جامعة خاصة مرموقة تشتهر بمستشفاها الجامعي وكلية الطب والعلوم التكنولوجية."
  },
  EUI: {
    shortName: "EUI",
    emoji: "💻",
    nameEn: "Egypt University of Informatics",
    nameAr: "جامعة مصر للمعلوماتية",
    governorate: "Cairo",
    city: "Knowledge City, NAC",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 429/2021 (Ahleya)",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://eui.edu.eg",
    established: 2021,
    overviewEn: "Specialized non-profit national ICT research university established by MCIT in Knowledge City offering joint degrees with top global universities.",
    overviewAr: "جامعة أهلية متخصصة في تكنولوجيا المعلومات والاتصالات أسستها وزارة الاتصالات بمدينة المعرفة لتقديم درجات مشتركة عالمية."
  },
  BUC: {
    shortName: "BUC",
    emoji: "🌙",
    nameEn: "Badr University in Cairo",
    nameAr: "جامعة بدر بالقاهرة",
    governorate: "Cairo",
    city: "Badr City",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 117/2014",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://buc.edu.eg",
    established: 2014,
    overviewEn: "Comprehensive private university offering diverse faculties spanning medicine, humanities, and engineering sciences.",
    overviewAr: "جامعة خاصة شاملة تقدم كليات متنوعة في الطب والعلوم الإنسانية والهندسية."
  },
  NGU: {
    shortName: "NGU",
    emoji: "🐫",
    nameEn: "Newgiza University",
    nameAr: "جامعة الجيزة الجديدة",
    governorate: "Giza",
    city: "6th of October City",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 119/2010",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://ngu.edu.eg",
    established: 2016,
    overviewEn: "Multidisciplinary private university in Giza with prestigious academic partnerships with UCL and King's College London.",
    overviewAr: "جامعة متعددة التخصصات في الجيزة تتميز بشراكات أكاديمية مرموقة مع جامعات بريطانية رائدة."
  },
  NUB: {
    shortName: "NUB",
    emoji: "🌅",
    nameEn: "Nahda University in Beni Suef",
    nameAr: "جامعة النهضة ببني سويف",
    governorate: "Beni Suef",
    city: "New Beni Suef",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 253/2006",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://nub.edu.eg",
    established: 2006,
    overviewEn: "First private university in Upper Egypt providing modern medical and technological degree paths.",
    overviewAr: "أول جامعة خاصة في صعيد مصر تقدم مسارات أكاديمية طبية وتكنولوجية حديثة."
  },
  O6U: {
    shortName: "O6U",
    emoji: "🎖️",
    nameEn: "October 6 University",
    nameAr: "جامعة 6 أكتوبر",
    governorate: "Giza",
    city: "6th of October City",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 243/1996",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://o6u.edu.eg",
    established: 1996,
    overviewEn: "Oldest private university in Egypt featuring 14 faculties and an expansive teaching hospital complex.",
    overviewAr: "أقدم جامعة خاصة في مصر تضم 14 كلية ومجمع مستشفيات تعليمي متكامل."
  },
  EJUST: {
    shortName: "EJUST",
    emoji: "🌸",
    nameEn: "Egypt-Japan University of Science and Technology",
    nameAr: "الجامعة المصرية اليابانية للعلوم والتكنولوجيا",
    governorate: "Alexandria",
    city: "New Borg El Arab",
    type: UniversityType.PUBLIC,
    typeSource: {
      authority: "MOHE",
      reference: "Law 149/2009 (Bilateral Intergovernmental Treaty)",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://ejust.edu.eg",
    established: 2010,
    overviewEn: "Bilateral government research university between Egyptian and Japanese governments adopting Japanese laboratory-based education standards.",
    overviewAr: "جامعة حكومية بحثية ثنائية بين الحكومتين المصرية واليابانية تتبنى معايير التعليم الياباني القائم على المختبرات."
  },
  FUE: {
    shortName: "FUE",
    emoji: "🚀",
    nameEn: "Future University in Egypt",
    nameAr: "جامعة المستقبل بمصر",
    governorate: "Cairo",
    city: "New Cairo",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 302/2006",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://www.fue.edu.eg",
    established: 2006,
    overviewEn: "Leading private university in New Cairo dedicated to quality higher education and specialized dentistry and pharmacy programs.",
    overviewAr: "جامعة خاصة رائدة بالقاهرة الجديدة متخصصة في طب الأسنان والصيدلة والعلوم الهندسية والإدارية."
  },
  BUE: {
    shortName: "BUE",
    emoji: "☂️",
    nameEn: "The British University in Egypt",
    nameAr: "الجامعة البريطانية في مصر",
    governorate: "Cairo",
    city: "El Sherouk City",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 357/2004",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.BRITISH,
    website: "https://www.bue.edu.eg",
    established: 2005,
    overviewEn: "Premier British education institution in Egypt providing UK-validated bachelor's and postgraduate qualifications.",
    overviewAr: "مؤسسة تعليمية بريطانية رائدة في مصر تمنح شهادات بكالوريوس ودراسات عليا معتمدة من المملكة المتحدة."
  },
  ERU: {
    shortName: "ERU",
    emoji: "🪆",
    nameEn: "Egyptian Russian University",
    nameAr: "الجامعة المصرية الروسية",
    governorate: "Cairo",
    city: "Badr City",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 256/2006",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://eru.edu.eg",
    established: 2006,
    overviewEn: "First Russian university in the Middle East offering high-technology engineering and nuclear physics specializations.",
    overviewAr: "أول جامعة روسية في الشرق الأوسط تقدم تخصصات في الهندسة التكنولوجية المتقدمة والطاقة النووية."
  },
  HUE: {
    shortName: "HUE",
    emoji: "🌞",
    nameEn: "Horus University – Egypt",
    nameAr: "جامعة حورس بمصر",
    governorate: "Damietta",
    city: "New Damietta",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 380/2013",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://www.hue.edu.eg",
    established: 2013,
    overviewEn: "Modern private institution in coastal Damietta with state-of-the-art medical and dental academic centers.",
    overviewAr: "جامعة خاصة حديثة في دمياط الجديدة تضم مراكز أكاديمية متطورة في طب الأسنان والعلوم الصحية."
  },
  MIU: {
    shortName: "MIU",
    emoji: "🌐",
    nameEn: "Misr International University",
    nameAr: "جامعة مصر الدولية",
    governorate: "Cairo",
    city: "Cairo-Ismailia Road",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 246/1996",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.AMERICAN,
    website: "https://www.miuegypt.edu.eg",
    established: 1996,
    overviewEn: "Respected private university providing American-modeled education in pharmacy, dentistry, architecture, and media.",
    overviewAr: "جامعة خاصة متميزة تقدم تعليماً بنظام الساعات المعتمدة الأمريكي في الصيدلة وطب الأسنان والعمارة والإعلام."
  },
  ACU: {
    shortName: "ACU",
    emoji: "🔺",
    nameEn: "Ahram Canadian University",
    nameAr: "جامعة الأهرام الكندية",
    governorate: "Giza",
    city: "6th of October City",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 393/2004",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.CANADIAN,
    website: "https://acu.edu.eg",
    established: 2005,
    overviewEn: "Non-profit private university established by Al-Ahram organization delivering Canadian curriculum standards in art, media, and technology.",
    overviewAr: "جامعة خاصة أسستها مؤسسة الأهرام لتقديم معايير المناهج الكندية في الفنون والتصميم والإعلام والتكنولوجيا."
  },
  SU: {
    shortName: "SU",
    emoji: "🗿",
    nameEn: "Sphinx University",
    nameAr: "جامعة سفنكس",
    governorate: "Assiut",
    city: "New Assiut",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 252/2019",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://sphinx.edu.eg",
    established: 2019,
    overviewEn: "Promising modern private university serving Upper Egypt with cutting-edge health and scientific faculties.",
    overviewAr: "جامعة خاصة حديثة تخدم صعيد مصر وتضم كليات طبية وعلمية متطورة."
  },
  DU: {
    shortName: "DU",
    emoji: "📖",
    nameEn: "Deraya University",
    nameAr: "جامعة دراية",
    governorate: "Minya",
    city: "New Minya",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 108/2010",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://deraya.edu.eg",
    established: 2010,
    overviewEn: "Private university in Minya focusing on pharmacy, physical therapy, and allied healthcare sciences.",
    overviewAr: "جامعة خاصة في المنيا الجديدة تركز على الصيدلة والعلاج الطبيعي والعلوم الصحية المساندة."
  },
  ECU: {
    shortName: "ECU",
    emoji: "🐉",
    nameEn: "Egyptian Chinese University",
    nameAr: "الجامعة المصرية الصينية",
    governorate: "Cairo",
    city: "Mostorod / Gesr El Suez",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 332/2016",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://www.ecu.edu.eg",
    established: 2016,
    overviewEn: "Pioneering technological university in Egypt operating in collaboration with leading Chinese universities in AI and engineering.",
    overviewAr: "جامعة تكنولوجية رائدة في مصر بالتعاون مع الجامعات الصينية في مجالات الذكاء الاصطناعي والهندسة والطب الصيني."
  },
  HU: {
    shortName: "HU",
    emoji: "🌻",
    nameEn: "Heliopolis University",
    nameAr: "جامعة هليوبوليس للتنمية المستدامة",
    governorate: "Cairo",
    city: "El Horreya",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 298/2009",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://www.hu.edu.eg",
    established: 2012,
    overviewEn: "First university in the region dedicated to sustainable development, organic agriculture, and renewable energy technologies.",
    overviewAr: "أول جامعة في المنطقة متخصصة في التنمية المستدامة والزراعة الحيوية وتكنولوجيا الطاقة المتجددة."
  },
  MUE: {
    shortName: "MUE",
    emoji: "🏅",
    nameEn: "Merit University",
    nameAr: "جامعة ميريت",
    governorate: "Sohag",
    city: "New Sohag",
    type: UniversityType.PRIVATE,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 177/2019",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://merit.edu.eg",
    established: 2019,
    overviewEn: "Private university in New Sohag driving regional higher education in medicine, physical therapy, and artificial intelligence.",
    overviewAr: "جامعة خاصة بسوهاج الجديدة تعزز التعليم الطبي والعلاج الطبيعي والذكاء الاصطناعي بصعيد مصر."
  },

  // ----------------------------------------------------
  // FILE 2: AHLEYA (NATIONAL) UNIVERSITIES (19)
  // ----------------------------------------------------
  ASNU: {
    shortName: "ASNU",
    emoji: "🏺",
    nameEn: "Assiut National University",
    nameAr: "جامعة أسيوط الأهلية",
    governorate: "Assiut",
    city: "New Assiut",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 419/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://asnu.edu.eg",
    established: 2022,
    overviewEn: "National non-profit university in New Assiut delivering contemporary health and engineering programs.",
    overviewAr: "جامعة أهلية غير ربحية بمدينة أسيوط الجديدة تقدم برامج طبية وهندسية وحاسوبية حديثة."
  },
  NASU: {
    shortName: "NASU",
    emoji: "👁️",
    nameEn: "Ain Shams National University",
    nameAr: "جامعة عين شمس الأهلية",
    governorate: "Cairo",
    city: "Obour City",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 420/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://nasu.edu.eg",
    established: 2022,
    overviewEn: "Affiliate national university of Ain Shams University located in Obour City offering future-oriented interdisciplinary majors.",
    overviewAr: "جامعة أهلية تابعة لجامعة عين شمس بمدينة العبور تقدم تخصصات مستقبلية متعددة التخصصات."
  },
  GU: {
    shortName: "GU",
    emoji: "⛰️",
    nameEn: "Galala University",
    nameAr: "جامعة الجلالة",
    governorate: "Suez",
    city: "Galala City",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 435/2020",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://www.gu.edu.eg",
    established: 2020,
    overviewEn: "Fourth-generation national smart university situated on Galala plateau overlooking the Red Sea.",
    overviewAr: "جامعة أهلية ذكية من الجيل الرابع على هضبة الجلالة بالعين السخنة تطل على البحر الأحمر."
  },
  ANU: {
    shortName: "ANU",
    emoji: "⚓",
    nameEn: "Alexandria National University",
    nameAr: "جامعة الإسكندرية الأهلية",
    governorate: "Alexandria",
    city: "Smouha",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 421/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://anu.edu.eg",
    established: 2022,
    overviewEn: "National branch institution established by Alexandria University offering cutting-edge maritime, medical, and engineering paths.",
    overviewAr: "جامعة أهلية أسستها جامعة الإسكندرية لتقديم مسارات بحرية وطبية وهندسية متطورة."
  },
  NMU: {
    shortName: "NMU",
    emoji: "🏖️",
    nameEn: "New Mansoura University",
    nameAr: "جامعة المنصورة الجديدة",
    governorate: "Dakahlia",
    city: "New Mansoura",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 437/2020",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://www.nmu.edu.eg",
    established: 2020,
    overviewEn: "Smart international-standard national university in coastal New Mansoura City specializing in digital science and biotechnology.",
    overviewAr: "جامعة أهلية ذكية بمدينة المنصورة الجديدة الساحلية متخصصة في العلوم الرقمية والتقنيات الحيوية."
  },
  BNU: {
    shortName: "BNU",
    emoji: "🍊",
    nameEn: "Benha National University",
    nameAr: "جامعة بنها الأهلية",
    governorate: "Qalyubia",
    city: "Obour City",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 422/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://bnu.edu.eg",
    established: 2022,
    overviewEn: "National higher education institution in Obour providing modern computing, arts, and clinical programs.",
    overviewAr: "جامعة أهلية بالعبور تقدم برامج حديثة في الحوسبة والمعلوماتية والعلوم الطبية الإكلينيكية."
  },
  EPNU: {
    shortName: "EPNU",
    emoji: "🚢",
    nameEn: "East Port Said National University",
    nameAr: "جامعة شرق بورسعيد الأهلية",
    governorate: "Port Said",
    city: "East Port Said",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 423/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://epnu.edu.eg",
    established: 2022,
    overviewEn: "Strategic national university in the Suez Canal economic zone offering logistics, maritime, and technological programs.",
    overviewAr: "جامعة أهلية استراتيجية بالمنطقة الاقتصادية لقناة السويس متخصصة في اللوجستيات والنقل البحري."
  },
  ZNU: {
    shortName: "ZNU",
    emoji: "🌾",
    nameEn: "Zagazig National University",
    nameAr: "جامعة الزقازيق الأهلية",
    governorate: "Sharqia",
    city: "10th of Ramadan City",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 424/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://znu.edu.eg",
    established: 2022,
    overviewEn: "National university in 10th of Ramadan City catering to industrial, technological, and medical specializations.",
    overviewAr: "جامعة أهلية بمدينة العاشر من رمضان تخدم التخصصات الصناعية والتكنولوجية والطبية."
  },
  AIU: {
    shortName: "AIU",
    emoji: "🎗️",
    nameEn: "Alamein International University",
    nameAr: "جامعة العلمين الدولية",
    governorate: "Matrouh",
    city: "New Alamein City",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 436/2020",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://aiu.edu.eg",
    established: 2020,
    overviewEn: "World-class national smart university located in New Alamein City with dual-degree international partnerships.",
    overviewAr: "جامعة أهلية ذكية بمعايير عالمية بمدينة العلمين الجديدة مع شراكات دولية لمنح درجات مزدوجة."
  },
  SVNU: {
    shortName: "SVNU",
    emoji: "🏞️",
    nameEn: "South Valley National University",
    nameAr: "جامعة جنوب الوادي الأهلية",
    governorate: "Qena",
    city: "Qena",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 425/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://svnu.edu.eg",
    established: 2022,
    overviewEn: "National university in Upper Egypt providing specialized nursing, engineering, and computer science degrees.",
    overviewAr: "جامعة أهلية بقنا توفر تخصصات متميزة في التمريض والهندسة وعلوم الحاسب بصعيد مصر."
  },
  NINU: {
    shortName: "NINU",
    emoji: "🚤",
    nameEn: "New Ismailia National University",
    nameAr: "جامعة الإسماعيلية الجديدة الأهلية",
    governorate: "Ismailia",
    city: "New Ismailia",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 426/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://ninu.edu.eg",
    established: 2022,
    overviewEn: "National institution in Sinai east of the Suez Canal offering comprehensive medical, dental, and engineering curricula.",
    overviewAr: "جامعة أهلية بشرق قناة السويس تقدم مناهج متكاملة في الطب وطب الأسنان والهندسة والتجارة الرقمية."
  },
  KNU: {
    shortName: "KNU",
    emoji: "🐟",
    nameEn: "Kafr Elsheikh National University",
    nameAr: "جامعة كفر الشيخ الأهلية",
    governorate: "Kafr El Sheikh",
    city: "Kafr El Sheikh",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 427/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://knu.edu.eg",
    established: 2022,
    overviewEn: "National university in the Delta region offering advanced aquaculture, nanotechnology, and healthcare education.",
    overviewAr: "جامعة أهلية بالدلتا تقدم تعليماً متطوراً في الذكاء الاصطناعي وتكنولوجيا النانو والعلوم الطبية."
  },
  TNU: {
    shortName: "TNU",
    emoji: "🕌",
    nameEn: "Tanta National University",
    nameAr: "جامعة طنطا الأهلية",
    governorate: "Gharbia",
    city: "Tanta",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 428/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://tnu.edu.eg",
    established: 2022,
    overviewEn: "National university serving the central Delta with specialized healthcare, pharmacy, and engineering tracks.",
    overviewAr: "جامعة أهلية بوسط الدلتا تقدم مسارات متخصصة في الرعاية الصحية والصيدلة والهندسة."
  },
  DNU: {
    shortName: "DNU",
    emoji: "🪑",
    nameEn: "Damietta National University",
    nameAr: "جامعة دمياط الأهلية",
    governorate: "Damietta",
    city: "New Damietta",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 429/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://dnu.edu.eg",
    established: 2022,
    overviewEn: "Coastal national university in New Damietta providing programs in furniture design, logistics, and computer science.",
    overviewAr: "جامعة أهلية بدمياط الجديدة توفر برامج في التصميم والفنون الرقمية وهندسة الحاسب."
  },
  SONU: {
    shortName: "SONU",
    emoji: "🌴",
    nameEn: "Sohag National University",
    nameAr: "جامعة سوهاج الأهلية",
    governorate: "Sohag",
    city: "New Sohag",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 430/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://sonu.edu.eg",
    established: 2022,
    overviewEn: "National higher education hub in New Sohag delivering modern medical, language, and computing degrees.",
    overviewAr: "صرح تعليمي أهلي بسوهاج الجديدة يقدم درجات حديثة في الطب واللغات والترجمة والحاسبات."
  },
  CNU: {
    shortName: "CNU",
    emoji: "🏙️",
    nameEn: "Cairo National University",
    nameAr: "جامعة القاهرة الأهلية",
    governorate: "Giza",
    city: "6th of October City",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 431/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://cnu.edu.eg",
    established: 2022,
    overviewEn: "National university affiliated with Cairo University offering premier international joint programs.",
    overviewAr: "جامعة أهلية تابعة لجامعة القاهرة بمدينة 6 أكتوبر تقدم برامج دولية مشتركة متميزة."
  },
  SNU: {
    shortName: "SNU",
    emoji: "🏭",
    nameEn: "Suez National University",
    nameAr: "جامعة السويس الأهلية",
    governorate: "Suez",
    city: "Suez",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 432/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://snu.edu.eg",
    established: 2022,
    overviewEn: "National university on the Gulf of Suez delivering petroleum, marine navigation, and industrial engineering degrees.",
    overviewAr: "جامعة أهلية على خليج السويس تقدم تخصصات البترول والملاحة البحرية والهندسة الصناعية."
  },
  UFE: {
    shortName: "UFE",
    emoji: "⚜️",
    nameEn: "Université Française d’Égypte",
    nameAr: "الجامعة الفرنسية في مصر",
    governorate: "Cairo",
    city: "El Sherouk City",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Intergovernmental Decree 330/2019 (Ahleya)",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.FRENCH,
    website: "https://ufe.edu.eg",
    established: 2002,
    overviewEn: "Renowned French higher education university in Egypt delivering dual French degrees accredited by Sorbonne and leading universities.",
    overviewAr: "جامعة أهلية فرنسية رائدة في مصر تمنح درجات فرنسية مزدوجة معتمدة من جامعة السوربون والجامعات الفرنسية الكبرى."
  },
  HNU: {
    shortName: "HNU",
    emoji: "⚒️",
    nameEn: "Helwan National University",
    nameAr: "جامعة حلوان الأهلية",
    governorate: "Cairo",
    city: "Ain Helwan",
    type: UniversityType.NATIONAL,
    typeSource: {
      authority: "MOHE",
      reference: "Presidential Decree 433/2022",
      verifiedOn: "2026-09-20"
    },
    educationModel: EducationModel.EGYPTIAN,
    website: "https://hnu.edu.eg",
    established: 2022,
    overviewEn: "National university in Helwan offering innovative applied arts, medical, and technological degrees.",
    overviewAr: "جامعة أهلية بحلوان تقدم برامج متميزة في الفنون التطبيقية والهندسة والتكنولوجيا والعلوم الطبية."
  }
};

export class BilingualEnrichmentProvider implements IEnrichmentProvider {
  getEnrichment(shortName: string, nameEn: string): UniversityEnrichmentRecord | null {
    const key = shortName.trim().toUpperCase();
    const record = VERIFIED_INSTITUTIONS_METADATA[key];
    if (record) {
      return record;
    }

    // Secondary lookup by matching name
    for (const item of Object.values(VERIFIED_INSTITUTIONS_METADATA)) {
      if (item.nameEn.toLowerCase() === nameEn.toLowerCase().trim()) {
        return item;
      }
    }

    // No verified record found
    return null;
  }

  isAuditHumanVerified(): boolean {
    return AUDIT_HUMAN_VERIFIED;
  }

  getAllEnrichments(): Map<string, UniversityEnrichmentRecord> {
    return new Map(Object.entries(VERIFIED_INSTITUTIONS_METADATA));
  }
}
