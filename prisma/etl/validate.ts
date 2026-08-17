import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

const RawUniversitySchema = z.object({
  name: z.string().optional(),
  nameEn: z.string().optional(),
  name_ar: z.string().optional(),
  nameAr: z.string().optional(),
}).passthrough().refine(
  (data) => !!(data.name || data.nameEn),
  { message: "University must have a valid name (name or nameEn)" }
);

export const validateUniversityData = (data: any) => {
  return RawUniversitySchema.safeParse(data);
};

export const streamError = (fileName: string, error: any, rawData: any) => {
  const errorLogPath = path.join(process.cwd(), "prisma", "etl", "etl-errors.jsonl");
  const errorEntry = {
    timestamp: new Date().toISOString(),
    fileName,
    error: error.issues ? error.issues : error.message,
    rawData: rawData.name || rawData.nameEn || "Unknown",
  };
  fs.appendFileSync(errorLogPath, JSON.stringify(errorEntry) + "\n", "utf8");
};
