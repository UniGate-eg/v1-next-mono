import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";
import { MajorMatchEngine } from "../../src/lib/majors/engine/MajorMatchEngine";
import { DegreeProgramMatchSource } from "../../src/lib/majors/engine/DegreeProgramMatchSource";
import { AcademicEntityMatchSource } from "../../src/lib/majors/engine/AcademicEntityMatchSource";
import { MAJOR_DEFINITIONS } from "../../src/lib/majors/MajorDefinitions";

// Initialize Engine
const sources = [
  new DegreeProgramMatchSource(),
  new AcademicEntityMatchSource()
];
const engine = new MajorMatchEngine(sources);

async function main() {
  console.log("🧪 Starting MajorMatchEngine Ground Truth Evaluation...");

  const FILE_PATH = path.join(process.cwd(), "src/data/Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx");
  const fileBuffer = fs.readFileSync(FILE_PATH);
  const wb = xlsx.read(fileBuffer, { type: "buffer" });

  const unis: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Universities"]);
  const facs: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Academic_Units"]);
  const progs: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Academic_Offerings"]);

  let matchedCount = 0;
  let totalCount = 0;

  const unmatched: any[] = [];
  const matchesByMajor: Record<string, number> = {};

  for (const p of progs) {
    const uniId = p["Offering ID"].split("-")[0]; // e.g. AUC-CS -> AUC
    const facId = p["Academic Unit ID"];
    
    const uni = unis.find(u => u["University ID"] === uniId);
    const fac = facs.find(f => f["Academic Unit ID"] === facId);

    if (!uni) continue;

    totalCount++;

    // Mock SlimSearchToken for the Engine
    const mockUniToken = {
      nameEn: uni["University Name"],
      type: "PRIVATE", // Dummy
      degreePrograms: [{ nameEn: p["Official Name"] }],
      structured_faculties: fac ? [{ nameEn: fac["Academic Unit Name"] }] : []
    };

    let matchedAny = false;

    // Test against all 19 defined majors
    for (const major of MAJOR_DEFINITIONS) {
      const matchResult = engine.score(mockUniToken as any, major);
      
      if (matchResult.score > 0) {
        matchedAny = true;
        matchesByMajor[major.name] = (matchesByMajor[major.name] || 0) + 1;
        break; // Count as matched if it hits at least one
      }
    }

    if (matchedAny) {
      matchedCount++;
    } else {
      unmatched.push({
        university: uni["Short Name"],
        faculty: fac?.["Academic Unit Name"] || "N/A",
        program: p["Official Name"]
      });
    }
  }

  const accuracy = (matchedCount / totalCount) * 100;
  
  console.log(`\n=== Engine Evaluation Results ===`);
  console.log(`Total Programs Analyzed: ${totalCount}`);
  console.log(`Recognized (Matched): ${matchedCount}`);
  console.log(`Unrecognized: ${totalCount - matchedCount}`);
  console.log(`Accuracy Rate: ${accuracy.toFixed(2)}%\n`);

  console.log("=== Matches By UI Category ===");
  Object.entries(matchesByMajor)
    .sort((a, b) => b[1] - a[1])
    .forEach(([major, count]) => {
      console.log(`- ${major}: ${count}`);
    });

  if (unmatched.length > 0) {
    console.log("\n=== Top 20 Unrecognized Programs ===");
    unmatched.slice(0, 20).forEach((u, i) => {
      console.log(`${i + 1}. [${u.university}] ${u.program} (Faculty: ${u.faculty})`);
    });
    console.log(`... and ${unmatched.length - 20} more.`);
  }
}

main().catch(console.error);
