export class NextCacheInvalidationService {
  async invalidateCatalogCaches(): Promise<{ revalidatedTags: string[]; revalidatedPaths: string[] }> {
    const tags = ["universities", "faculties", "majors"];
    const paths = ["/", "/universities", "/majors"];

    console.log("🔄 Triggering cache revalidation for public exploration routes...");

    // If revalidateTag is available in runtime (Next.js server context)
    try {
      const nextCache = await import("next/cache");
      if (typeof nextCache.revalidateTag === "function") {
        for (const tag of tags) {
          nextCache.revalidateTag(tag);
        }
      }
      if (typeof nextCache.revalidatePath === "function") {
        for (const p of paths) {
          nextCache.revalidatePath(p);
        }
      }
      console.log("✔ Next.js ISR cache tags and paths successfully signaled.");
    } catch {
      // In CLI standalone runner, next/cache may not be bound to an active web server
      console.log("ℹ️ CLI runner: ISR revalidation will take effect upon Next.js app reboot or next request cycle.");
    }

    return {
      revalidatedTags: tags,
      revalidatedPaths: paths
    };
  }
}
