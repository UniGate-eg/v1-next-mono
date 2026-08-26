import { universityRepository, auditLogRepository } from "@/lib/di";
import { CreateUniversityInput, UpdateUniversityInput } from "../../schemas/university.schema";
import { CacheInvalidator } from "../../lib/cache-invalidator";

export class AdminUniversityService {
  static async createUniversity(
    actorId: string, 
    data: CreateUniversityInput,
    repo = universityRepository,
    audit = auditLogRepository
  ) {
    const university = await repo.create(data);
    
    await audit.create({
      actorId,
      action: "CREATE_UNIVERSITY",
      entityType: "University",
      entityId: university.id,
      afterState: data,
    });

    CacheInvalidator.invalidateGlobalLists();
    return university;
  }

  static async updateUniversity(
    actorId: string, 
    id: string, 
    data: UpdateUniversityInput,
    repo = universityRepository,
    audit = auditLogRepository
  ) {
    const original = await repo.findById(id);
    if (!original) throw new Error("University not found");

    const university = await repo.update(id, data);

    await audit.create({
      universityId: id,
      actorId,
      action: "UPDATE_UNIVERSITY",
      entityType: "University",
      entityId: id,
      beforeState: original,
      afterState: data,
    });

    CacheInvalidator.invalidateUniversity(university.slug);
    return university;
  }

  static async archiveUniversity(
    actorId: string, 
    id: string,
    repo = universityRepository,
    audit = auditLogRepository
  ) {
    const original = await repo.findById(id);
    if (!original) throw new Error("University not found");

    await repo.update(id, { id, publishStatus: "ARCHIVED" });

    await audit.create({
      universityId: id,
      actorId,
      action: "ARCHIVE_UNIVERSITY",
      entityType: "University",
      entityId: id,
      beforeState: original,
      afterState: { publishStatus: "ARCHIVED" },
    });

    CacheInvalidator.invalidateUniversity(original.slug);
    CacheInvalidator.invalidateGlobalLists();
  }
}
