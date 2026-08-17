import fs from "fs";
import path from "path";
import { universityRepository } from "@/lib/di";
import { MarketingHomeClient } from "./MarketingHomeClient";
import type { SlimSearchToken } from "@/types/university.types";
import type { Metadata } from "next";

export const revalidate = 3600; // ISR 1 hour

export const metadata: Metadata = {
  title: "UniGate | Egyptian Universities Directory & Comparison Platform | بوابة الجامعات المصرية",
  description: "Comprehensive guide to Egyptian universities. Find your perfect university match, compare tuition fees, admission requirements, and explore accredited degree programs.",
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

export default async function MarketingHomePage() {
  const initialUniversities = await getInitialUniversities();

  return <MarketingHomeClient initialUniversities={initialUniversities} />;
}
