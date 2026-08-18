import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { transformUniversity } from "./transform";
import { validateUniversityData, streamError } from "./validate";
import { CheckpointManager } from "./checkpoint";
import { universitiesDatabase } from "../../src/data/database.js";

const prisma = new PrismaClient();
const checkpoint = new CheckpointManager();

async function main() {
  console.log("🚀 Starting Deep ETL Ingestion Pipeline to Neon Serverless Postgres...");

  let rawData: any[] = [];
  const DB_FILE = path.join(process.cwd(), "Egyptian_Universities_Deep_Exhaustive_Database.json");

  if (fs.existsSync(DB_FILE)) {
    console.log(`📂 Loading data from ${DB_FILE}`);
    rawData = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } else if (Array.isArray(universitiesDatabase)) {
    console.log("📂 Loading data from src/data/database.js");
    rawData = universitiesDatabase;
  } else {
    console.error("❌ No database source found (checked JSON and database.js).");
    process.exit(1);
  }

  console.log(`📦 Found ${rawData.length} universities in source.`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const rawUni of rawData) {
    try {
      // 1. Validation
      const validation = validateUniversityData(rawUni);
      if (!validation.success) {
        streamError("source_data", validation.error, rawUni);
        errorCount++;
        continue;
      }

      // 2. Transformation
      const normalized = transformUniversity(rawUni);

      console.log(`🔄 Ingesting ${normalized.slug} (${normalized.universityData.nameEn})...`);

      // 3. Transactional Injection
      await prisma.$transaction(async (tx) => {
        // Upsert University Root
        const university = await tx.university.upsert({
          where: { slug: normalized.slug },
          create: normalized.universityData as any,
          update: normalized.universityData as any,
        });

        // Clear existing nested entities before re-inserting to prevent duplicates
        await tx.degreeProgram.deleteMany({ where: { universityId: university.id } });
        await tx.faculty.deleteMany({ where: { universityId: university.id } });
        await tx.accreditation.deleteMany({ where: { universityId: university.id } });

        // Upsert Faculties & Build Lookup Map
        const facultyMap = new Map<string, string>();
        for (const facultyInput of normalized.faculties) {
          const faculty = await tx.faculty.create({
            data: { ...facultyInput, universityId: university.id },
          });
          facultyMap.set(faculty.nameEn.toLowerCase(), faculty.id);
        }

        // Insert Degree Programs with Resolved Faculty Foreign Keys
        for (const programInput of normalized.degreePrograms) {
          const matchedFacultyId = programInput.facultyName
            ? facultyMap.get(programInput.facultyName.toLowerCase())
            : null;

          await tx.degreeProgram.create({
            data: {
              ...programInput.data,
              universityId: university.id,
              facultyId: matchedFacultyId,
            } as any,
          });
        }

        // Insert Accreditations
        for (const accInput of normalized.accreditations) {
          await tx.accreditation.create({
            data: {
              ...accInput,
              universityId: university.id,
            },
          });
        }
      });

      checkpoint.markProcessed(normalized.slug);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to ingest university: ${rawUni.name || rawUni.nameEn}`, error);
      streamError("source_data", error, rawUni);
      errorCount++;
    }
  }

  console.log("\n✅ ETL Ingestion Complete!");
  console.log(`📈 Successfully Ingested: ${successCount}`);
  console.log(`⏩ Skipped: ${skipCount}`);
  console.log(`⚠️ Errors: ${errorCount} (Check prisma/etl/etl-errors.jsonl)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
