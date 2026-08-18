import fs from "fs";
import path from "path";
import { universityRepository } from "@/lib/di";
import { UniversitiesDirectoryClient } from "./UniversitiesDirectoryClient";
import type { SlimSearchToken } from "@/types/university.types";
import type { Metadata } from "next";

export const revalidate = 3600; // ISR revalidate every 1 hour

export const metadata: Metadata = {
  title: "All Universities in Egypt | دليل الجامعات المصرية | UniGate",
  description: "Browse, compare, and filter accredited public, private, national, and international universities in Egypt with rankings, tuition fees, and admission criteria.",
};

async function getInitialUniversities(): Promise<SlimSearchToken[]> {
  try {
    const unis = await universityRepository.findForSearch();
    if (unis && unis.length > 0) return unis;
  } catch (err) {
    console.warn("Failed to fetch universities from repository, fallback to search-index.json", err);
  }

  try {
    const indexPath = path.join(process.cwd(), "public", "search-index.json");
    if (fs.existsSync(indexPath)) {
      return JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to read search-index.json fallback", err);
  }

  return [];
}

export default async function UniversitiesPage() {
  const initialUniversities = await getInitialUniversities();

  return <UniversitiesDirectoryClient initialUniversities={initialUniversities} />;
}
