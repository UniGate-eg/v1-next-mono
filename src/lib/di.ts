import { db } from "./prisma";
import { PostgresUniversityRepository } from "../server/repositories/PostgresUniversityRepository";
import { AuditLogRepository } from "../server/repositories/AuditLogRepository";
import { PostgresSuggestionRepository, ISuggestionRepository } from "../server/repositories/SuggestionRepository";
import { IUniversityReader, IUniversityWriter } from "../server/repositories/interfaces/IUniversityRepository";
import { IAuditLogRepository } from "../server/repositories/interfaces/IAuditLogRepository";
import { primary } from "./prisma";

import { CachedUniversityRepository } from "../server/repositories/CachedUniversityRepository";

// We use the primary client for the repositories by default.
// In a serverless environment, we might want to pass the lazy 'db' wrapper or 
// instantiate the repositories per request if we need the dynamic fallback.
// Since these classes take the PrismaClient instance, we import the actual instance.

const postgresUniversityRepo = new PostgresUniversityRepository(primary);
export const universityRepository: IUniversityReader & IUniversityWriter = new CachedUniversityRepository(postgresUniversityRepo) as any;
export const auditLogRepository: IAuditLogRepository = new AuditLogRepository(primary);
import { UniversityService } from "../server/services/UniversityService";
export const suggestionRepository: ISuggestionRepository = new PostgresSuggestionRepository(primary);
export const publicUniversityService = new UniversityService(universityRepository);
