import { NextResponse, NextRequest } from "next/server";
import { universityRepository } from "../../../../lib/di";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let resolvedSlug = "unknown";
  try {
    const { slug } = await params;
    resolvedSlug = slug;
    const university = await universityRepository.findBySlug(slug);
    
    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    // Only allow published universities to be viewed publicly via API
    if (university.publishStatus !== "PUBLISHED") {
      return NextResponse.json(
        { error: "University not found or not published" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: university });
  } catch (error) {
    console.error(`[API] Error fetching university by slug ${resolvedSlug}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
