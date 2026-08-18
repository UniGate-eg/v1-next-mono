import { IUniversityReader } from "./interfaces/IUniversityRepository";
import { UniversityDTO, SlimSearchToken, UniversityFilters } from "../../types/university.types";

export class CachedUniversityRepository implements IUniversityReader {
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 1000 * 60 * 5; // 5 minutes

  constructor(private fallback: IUniversityReader) {}

  private async getCached<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const data = await fetchFn();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (cached) {
        console.warn(`[Cache Fallback] Database failed, serving stale data for ${key}`);
        return cached.data; // Stale fallback
      }
      throw error;
    }
  }

  async findMany(filters?: UniversityFilters, page = 1, limit = 10): Promise<{ data: UniversityDTO[], total: number }> {
    const key = `findMany:${JSON.stringify(filters || {})}:${page}:${limit}`;
    return this.getCached(key, () => this.fallback.findMany(filters, page, limit));
  }

  async findBySlug(slug: string): Promise<UniversityDTO | null> {
    const key = `findBySlug:${slug}`;
    return this.getCached(key, () => this.fallback.findBySlug(slug));
  }

  async findById(id: string): Promise<UniversityDTO | null> {
    const key = `findById:${id}`;
    return this.getCached(key, () => this.fallback.findById(id));
  }

  async findForSearch(): Promise<SlimSearchToken[]> {
    const key = `findForSearch`;
    return this.getCached(key, () => this.fallback.findForSearch());
  }

  // Writer methods (pass-through and invalidate cache)
  async create(data: any): Promise<UniversityDTO> {
    const result = await (this.fallback as any).create(data);
    this.cache.clear(); // Invalidate cache on write
    return result;
  }

  async update(id: string, data: any): Promise<UniversityDTO> {
    const result = await (this.fallback as any).update(id, data);
    this.cache.clear();
    return result;
  }

  async archive(id: string): Promise<void> {
    await (this.fallback as any).archive(id);
    this.cache.clear();
  }

  async publish(id: string): Promise<void> {
    await (this.fallback as any).publish(id);
    this.cache.clear();
  }
}
