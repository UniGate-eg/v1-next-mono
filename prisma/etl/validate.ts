import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

const RawFacultySchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  deanName: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  departments: z.array(z.string()).optional(),
});

const RawProgramSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  facultyName: z.string().optional(),
  degreeType: z.string().default("Bachelor's Degree"),
  durationYears: z.number().optional(),
  tuitionEgpPerYear: z.string().optional(),
  tuitionUsdPerYear: z.string().optional(),
});

const RawUniversitySchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  type: z.string().min(1),
  governorate: z.string().min(1),
  slug: z.string().optional(),
  city: z.string().optional(),
  established: z.number().optional(),
  faculties: z.array(RawFacultySchema).optional(),
  programs: z.array(RawProgramSchema).optional(),
});

export const validateUniversityData = (data: any) => {
  return RawUniversitySchema.safeParse(data);
};

export const streamError = (fileName: string, error: any, rawData: any) => {
  const errorLogPath = path.join(process.cwd(), "prisma", "etl", "etl-errors.jsonl");
  const errorEntry = {
    timestamp: new Date().toISOString(),
    fileName,
    error: error.issues ? error.issues : error.message,
    rawData: rawData.nameEn || "Unknown",
  };
  fs.appendFileSync(errorLogPath, JSON.stringify(errorEntry) + "\n", "utf8");
};
