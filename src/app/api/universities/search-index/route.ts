import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { universityRepository } from "@/lib/di";

const getCachedSearchIndex = unstable_cache(
  async () => {
    return await universityRepository.findForSearch();
  },
  ["search-index"],
  {
    revalidate: 3600,
    tags: ["universities", "universities-list", "search-index"],
  }
);

export async function GET() {
  try {
    const data = await getCachedSearchIndex();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load search index:", error);
    return NextResponse.json(
      { error: "Failed to load universities" },
      { status: 500 }
    );
  }
}
