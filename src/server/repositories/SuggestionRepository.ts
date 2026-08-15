import { db } from "@/lib/prisma";
import type { ISuggestionRepository, SuggestionRecord } from "./interfaces/ISuggestionRepository";
import type { SuggestionType } from "@/schemas/suggestion.schema";

export class SuggestionRepository implements ISuggestionRepository {
  async create(
    userId: string,
    content: string,
    type: SuggestionType
  ): Promise<SuggestionRecord> {
    return db((client) =>
      client.suggestion.create({
        data: {
          userId,
          content,
          type,
          status: "PENDING",
        },
      })
    ) as Promise<SuggestionRecord>;
  }

  async findByUser(userId: string): Promise<SuggestionRecord[]> {
    return db((client) =>
      client.suggestion.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      })
    ) as Promise<SuggestionRecord[]>;
  }
}
