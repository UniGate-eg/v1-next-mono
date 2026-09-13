import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

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
});
