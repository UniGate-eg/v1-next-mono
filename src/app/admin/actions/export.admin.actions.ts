"use server";

import { headers } from "next/headers";
import { auth } from "../../../lib/auth";
import { universityRepository } from "../../../lib/di";
import { format } from "date-fns";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  const user = session.user as any;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Requires Admin privileges");
  }
  
  return user;
}

export async function exportDatabaseSnapshotAction() {
  try {
    await requireAdmin();
    
    // Fetch all universities to export
    const { data: universities } = await universityRepository.findMany({}, 1, 10000);
    
    // In a real scenario, this might trigger a background job to generate a CSV or JSON dump,
    // upload it to S3, and return a download link.
    // For this example, we'll return the JSON directly so the client can trigger a download.
    const snapshotData = JSON.stringify(universities, null, 2);
    
    return { 
      success: true, 
      data: snapshotData,
      filename: `unigate_snapshot_${format(new Date(), "yyyy-MM-dd_HH-mm")}.json`
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
