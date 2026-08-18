import { IUniversityReader, IUniversityWriter } from "./interfaces/IUniversityRepository";
import { PostgresUniversityRepository } from "./PostgresUniversityRepository";
import { CachedUniversityRepository } from "./CachedUniversityRepository";
import { PrismaClient } from "@prisma/client";

export class UniversityRepositoryFactory {
  static createReader(prisma: PrismaClient, useCache = true): IUniversityReader {
    const postgresRepo = new PostgresUniversityRepository(prisma);
    return useCache ? new CachedUniversityRepository(postgresRepo) : postgresRepo;
  }

  static createWriter(prisma: PrismaClient): IUniversityWriter {
    return new PostgresUniversityRepository(prisma);
  }
}
