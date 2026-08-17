import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { transformUniversity } from "./transform";
import { validateUniversityData, streamError } from "./validate";
import { CheckpointManager } from "./checkpoint";

const prisma = new PrismaClient();
const checkpoint = new CheckpointManager();

// Look for the database file in the project root
const DB_FILE = path.join(process.cwd(), "Egyptian_Universities_Deep_Exhaustive_Database.json");

async function main() {
  console.log("🚀 Starting Deep ETL Ingestion Pipeline...");
  
  if (!fs.existsSync(DB_FILE)) {
    console.error(`❌ Database file not found at ${DB_FILE}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  
  if (!Array.isArray(rawData)) {
    console.error("❌ Expected JSON file to contain an array of universities.");
    process.exit(1);
  }

  console.log(`📦 Found ${rawData.length} universities in source file.`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const rawUni of rawData) {
    try {
      // 1. Validation
      const validation = validateUniversityData(rawUni);
      if (!validation.success) {
        streamError("Egyptian_Universities_Deep_Exhaustive_Database.json", validation.error, rawUni);
        errorCount++;
        continue;
      }

      // 2. Transformation
      const normalized = transformUniversity(validation.data as any);
      
      // 3. Idempotency Check
      if (checkpoint.isProcessed(normalized.slug)) {
        console.log(`⏩ Skipping ${normalized.slug} (already processed)`);
        skipCount++;
        continue;
      }

      console.log(`🔄 Ingesting ${normalized.slug}...`);

      // 4. Transactional Injection
      await prisma.$transaction(async (tx) => {
        // Upsert University Root
        const university = await tx.university.upsert({
          where: { slug: normalized.slug },
          create: normalized.universityData as any,
          update: normalized.universityData as any,
        });

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
      });

      // 5. Mark Checkpoint
      checkpoint.markProcessed(normalized.slug);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to ingest university: ${rawUni.nameEn}`, error);
      streamError("Egyptian_Universities_Deep_Exhaustive_Database.json", error, rawUni);
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
