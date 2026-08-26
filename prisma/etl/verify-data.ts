import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const FILE_PATH = path.join(process.cwd(), "src/data/Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx");
  const fileBuffer = fs.readFileSync(FILE_PATH);
  const wb = xlsx.read(fileBuffer, { type: "buffer" });

  const unis: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Universities"]);
  const facs: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Academic_Units"]);
  const progs: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Academic_Offerings"]);

  for (const rawUni of unis.slice(0, 3)) {
    const shortName = rawUni["Short Name"];
    
    const dbUni = await prisma.university.findFirst({
      where: { shortName },
      include: {
        faculties: true,
        degreePrograms: true,
      }
    });

    if (!dbUni) {
      console.log(`Missing in DB: ${shortName}`);
      continue;
    }

    const excelFacs = facs.filter(f => f["University ID"] === rawUni["University ID"]);
    const excelProgs = progs.filter(p => excelFacs.some(f => f["Academic Unit ID"] === p["Academic Unit ID"]));

    console.log(`\n=== Verification for ${shortName} ===`);
    console.log(`Faculties -> Excel: ${excelFacs.length} | DB: ${dbUni.faculties.length}`);
    console.log(`Programs  -> Excel: ${excelProgs.length} | DB: ${dbUni.degreePrograms.length}`);
    
    if (dbUni.degreePrograms.length > 0) {
      console.log("Sample mismatch check (First Program):");
      console.log(`  Excel: ${excelProgs[0]?.["Official Name"]}`);
      console.log(`  DB:    ${dbUni.degreePrograms[0]?.nameEn}`);
      
      const facultyForDbProg = dbUni.faculties.find(f => f.id === dbUni.degreePrograms[0].facultyId);
      console.log(`  DB Prog linked to Faculty: ${facultyForDbProg?.nameEn}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
