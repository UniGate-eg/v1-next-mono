import { universityRepository, auditLogRepository } from "../../lib/di";
import { CreateUniversityInput, UpdateUniversityInput } from "../../schemas/university.schema";
import { CacheInvalidator } from "../../lib/cache-invalidator";

export class AdminUniversityService {
  static async createUniversity(actorId: string, data: CreateUniversityInput) {
    const university = await universityRepository.create(data);
    
    await auditLogRepository.create({
      actorId,
      action: "CREATE_UNIVERSITY",
      entityType: "University",
      entityId: university.id,
      afterState: data,
    });

    CacheInvalidator.invalidateGlobalLists();
    return university;
  }

  static async updateUniversity(actorId: string, id: string, data: UpdateUniversityInput) {
    const original = await universityRepository.findById(id);
    if (!original) throw new Error("University not found");

    const university = await universityRepository.update(id, data);

    await auditLogRepository.create({
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

  static async archiveUniversity(actorId: string, id: string) {
    const original = await universityRepository.findById(id);
    if (!original) throw new Error("University not found");

    await universityRepository.archive(id);

    await auditLogRepository.create({
      universityId: id,
      actorId,
      action: "ARCHIVE_UNIVERSITY",
      entityType: "University",
      entityId: id,
      beforeState: { publishStatus: original.publishStatus },
      afterState: { publishStatus: "ARCHIVED" },
    });

    CacheInvalidator.invalidateUniversity(original.slug);
  }
}
