import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { UNIVERSITY_TYPE_META } from "../../src/lib/university-type";
import { EDUCATION_MODEL_META } from "../../src/lib/education-model";

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (
        file === "node_modules" ||
        file === ".next" ||
        file === "university-type" ||
        file === "data" ||
        file === "__tests__"
      ) {
        continue;
      }
      getAllSourceFiles(filePath, fileList);
    } else if (
      (file.endsWith(".ts") || file.endsWith(".tsx")) &&
      !file.endsWith(".d.ts")
    ) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

describe("University Type Consistency Static Guard", () => {
  const srcDir = path.resolve(__dirname, "../../src");
  const sourceFiles = getAllSourceFiles(srcDir);

  it("disallows phantom type literals (TECHNOLOGICAL, SPECIALIZED) outside university-type module", () => {
    const violations: Array<{ file: string; match: string }> = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      // Match standalone TECHNOLOGICAL or SPECIALIZED as string literals or type tokens
      const techMatch = content.match(/["']TECHNOLOGICAL["']/g);
      const specMatch = content.match(/["']SPECIALIZED["']/g);

      if (techMatch || specMatch) {
        violations.push({
          file: path.relative(srcDir, filePath),
          match: [techMatch, specMatch].filter(Boolean).flat().join(", "),
        });
      }
    }

    expect(
      violations,
      `Found phantom university types in source files: ${JSON.stringify(violations, null, 2)}`
    ).toEqual([]);
  });

  it("disallows a local EDUCATION_MODEL_LABELS map re-appearing outside education-model module", () => {
    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      if (filePath.includes(`${path.sep}education-model${path.sep}`)) continue;
      const content = fs.readFileSync(filePath, "utf-8");
      if (/\bEDUCATION_MODEL_LABELS\b/.test(content)) {
        violations.push(path.relative(srcDir, filePath));
      }
    }

    expect(
      violations,
      `Found a duplicate EDUCATION_MODEL_LABELS map outside src/lib/education-model: ${JSON.stringify(violations)}. ` +
        `Import from @/lib/education-model instead.`
    ).toEqual([]);
  });

  it("uses a distinct icon for every institution type and education model shown together (e.g. German model vs National type both showed 🏛️)", () => {
    const typeIcons = Object.entries(UNIVERSITY_TYPE_META).map(([type, meta]) => ({ set: "type", key: type, icon: meta.icon }));
    const modelIcons = Object.entries(EDUCATION_MODEL_META).map(([model, meta]) => ({ set: "model", key: model, icon: meta.icon }));
    const all = [...typeIcons, ...modelIcons];

    const byIcon = new Map<string, typeof all>();
    for (const entry of all) {
      byIcon.set(entry.icon, [...(byIcon.get(entry.icon) || []), entry]);
    }

    const collisions = [...byIcon.values()].filter((group) => group.length > 1);

    expect(
      collisions,
      `Found icon collisions across university type and education model: ${JSON.stringify(collisions)}. ` +
        `A university card shows a type badge and a model badge side by side, so every icon must be unique across both sets.`
    ).toEqual([]);
  });
});
