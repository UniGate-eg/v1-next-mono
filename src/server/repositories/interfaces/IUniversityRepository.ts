import { CreateUniversityInput, UpdateUniversityInput } from "../../../schemas/university.schema";
import { UniversityDTO, SlimSearchToken, UniversityFilters } from "../../../types/university.types";

export interface IUniversityReader {
  findMany(filters?: UniversityFilters, page?: number, limit?: number): Promise<{ data: UniversityDTO[], total: number }>;
  findBySlug(slug: string): Promise<UniversityDTO | null>;
  findById(id: string): Promise<UniversityDTO | null>;
  findForSearch(): Promise<SlimSearchToken[]>;
}

export interface IUniversityWriter {
  create(data: CreateUniversityInput): Promise<UniversityDTO>;
  update(id: string, data: UpdateUniversityInput): Promise<UniversityDTO>;
  archive(id: string): Promise<void>;
  publish(id: string): Promise<void>;
}
