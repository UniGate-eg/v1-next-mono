import { revalidateTag, revalidatePath } from "next/cache";

export class CacheInvalidator {
  /**
   * Invalidates all cache entries for a specific university.
   * This ensures the client UI and `/universities/[slug]` route updates instantly.
   */
  static invalidateUniversity(slug: string) {
    try {
      revalidateTag(`university-${slug}`);
      revalidateTag(`universities-list`);
      revalidateTag(`search-index`);
      revalidatePath(`/universities/${slug}`);
      revalidatePath(`/`);
    } catch (error) {
      console.warn(`[CacheInvalidator] Failed to invalidate cache for ${slug}`, error);
    }
  }

  /**
   * Invalidates the global lists of universities.
   */
  static invalidateGlobalLists() {
    try {
      revalidateTag(`universities-list`);
      revalidateTag(`search-index`);
      revalidatePath(`/universities`);
      revalidatePath(`/`);
    } catch (error) {
      console.warn(`[CacheInvalidator] Failed to invalidate global lists`, error);
    }
  }
}
