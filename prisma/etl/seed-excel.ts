import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";
import { PrismaClient, UniversityType, EducationModel, PublishStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Slugify helper
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

async function main() {
  console.log("🚀 Starting Excel ETL Ingestion Pipeline to Neon Serverless Postgres...");

  const FILE_PATH = path.join(process.cwd(), "src/data/Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx");
  
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ Excel file not found at ${FILE_PATH}`);
    process.exit(1);
  }

  console.log("📦 Parsing Excel file...");
  const fileBuffer = fs.readFileSync(FILE_PATH);
  const wb = xlsx.read(fileBuffer, { type: "buffer" });

  const rawUnis: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Universities"]);
  const rawFaculties: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Academic_Units"]);
  const rawPrograms: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Academic_Offerings"]);

  console.log(`📊 Found ${rawUnis.length} Universities, ${rawFaculties.length} Faculties, and ${rawPrograms.length} Programs.`);

  let successCount = 0;
  let notFoundCount = 0;

  for (const rawUni of rawUnis) {
    const uniId = rawUni["University ID"];
    const uniName = rawUni["University Name"];
    const shortName = rawUni["Short Name"];

    // Try to find the university in the DB by shortName or slug
    let dbUni = await prisma.university.findFirst({
      where: {
        OR: [
          { shortName: { equals: shortName, mode: "insensitive" } },
          { slug: { equals: slugify(shortName), mode: "insensitive" } },
          { slug: { equals: slugify(uniName), mode: "insensitive" } }
        ]
      }
    });

    if (!dbUni) {
      console.log(`⚠️ University not found in DB, creating basic entry: ${uniName} (${shortName})`);
      // Create a basic entry if not exists
      dbUni = await prisma.university.create({
        data: {
          slug: slugify(shortName || uniName),
          nameEn: uniName,
          nameAr: uniName, // Fallback
          shortName: shortName,
          governorate: "Cairo", // Fallback
          type: UniversityType.PRIVATE, // Fallback
          educationModel: EducationModel.EGYPTIAN,
          publishStatus: PublishStatus.PUBLISHED,
        }
      });
    }

    console.log(`\n⚙️  Processing: ${dbUni.nameEn} (ID: ${dbUni.id})`);

    // Get faculties for this uni
    const uniFaculties = rawFaculties.filter(f => f["University ID"] === uniId);
    
    await prisma.$transaction(async (tx) => {
      // Clear old faculties & programs to prevent duplicates
      await tx.degreeProgram.deleteMany({ where: { universityId: dbUni.id } });
      await tx.faculty.deleteMany({ where: { universityId: dbUni.id } });

      const facultyIdMap = new Map<string, string>(); // Maps Excel "Academic Unit ID" to Prisma CUID

      // 1. Insert Faculties (Needs to be sequential to get IDs)
      for (const f of uniFaculties) {
        const facultyName = f["Academic Unit Name"];
        const excelFacultyId = f["Academic Unit ID"];

        const createdFaculty = await tx.faculty.create({
          data: {
            universityId: dbUni.id,
            nameEn: facultyName,
            nameAr: facultyName, // Fallback
          }
        });
        
        facultyIdMap.set(excelFacultyId, createdFaculty.id);
      }

      // 2. Insert Degree Programs
      const uniPrograms = rawPrograms.filter(p => {
        const facId = p["Academic Unit ID"];
        return uniFaculties.some(f => f["Academic Unit ID"] === facId);
      });

      const programsData = uniPrograms.map(p => {
        const programName = p["Official Name"];
        const excelFacultyId = p["Academic Unit ID"];
        const degreeType = p["Offering Type"] || "Bachelor";
        const facultyId = facultyIdMap.get(excelFacultyId);

        return {
          slug: slugify(`${dbUni.shortName}-${programName}-${Math.random().toString(36).substring(7)}`),
          universityId: dbUni.id,
          facultyId: facultyId || null,
          nameEn: programName,
          nameAr: programName, // Fallback
          degreeType: degreeType,
          studyLanguage: "English",
          durationYears: 4,
        };
      });

      if (programsData.length > 0) {
        await tx.degreeProgram.createMany({
          data: programsData
        });
      }
    }, { timeout: 30000 }); // Increase timeout to 30s

    successCount++;
  }

  console.log("\n✅ ETL Ingestion Complete!");
  console.log(`🎓 Successfully Updated: ${successCount} Universities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
