import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";
import { MajorMatchEngine } from "../../src/lib/majors/engine/MajorMatchEngine";
import { DegreeProgramMatchSource } from "../../src/lib/majors/engine/DegreeProgramMatchSource";
import { AcademicEntityMatchSource } from "../../src/lib/majors/engine/AcademicEntityMatchSource";
import { MAJOR_DEFINITIONS } from "../../src/lib/majors/MajorDefinitions";

const sources = [new DegreeProgramMatchSource(), new AcademicEntityMatchSource()];
const engine = new MajorMatchEngine(sources);

async function main() {
  const FILE_PATH = path.join(process.cwd(), "src/data/Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx");
  const fileBuffer = fs.readFileSync(FILE_PATH);
  const wb = xlsx.read(fileBuffer, { type: "buffer" });
  
  const unis: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Universities"]);
  const facs: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Academic_Units"]);
  const progs: any[] = xlsx.utils.sheet_to_json(wb.Sheets["Academic_Offerings"]);

  const unrecFreq: Record<string, number> = {};
  
  for (const p of progs) {
    const uniId = p["Offering ID"].split("-")[0];
    const facId = p["Academic Unit ID"];
    const uni = unis.find(u => u["University ID"] === uniId);
    const fac = facs.find(f => f["Academic Unit ID"] === facId);
    if (!uni) continue;

    const mockUniToken = {
      nameEn: uni["University Name"],
      type: "PRIVATE",
      degreePrograms: [{ nameEn: p["Official Name"] }],
      structured_faculties: fac ? [{ nameEn: fac["Academic Unit Name"] }] : []
    };

    let matchedAny = false;
    for (const major of MAJOR_DEFINITIONS) {
      if (engine.score(mockUniToken as any, major).score > 0) {
        matchedAny = true;
        break;
      }
    }

    if (!matchedAny) {
      const name = p["Official Name"];
      unrecFreq[name] = (unrecFreq[name] || 0) + 1;
    }
  }

  const sorted = Object.entries(unrecFreq).sort((a, b) => b[1] - a[1]).slice(0, 30);
  console.log("Top Unrecognized Programs:");
  sorted.forEach(s => console.log(s[0], ":", s[1]));
}

main();
