import { PrismaClient } from "@prisma/client";
import { CreateSuggestionInput } from "../../schemas/suggestion.schema";
import { SuggestionDTO } from "../../types/audit.types";

export interface ISuggestionRepository {
  create(data: CreateSuggestionInput): Promise<SuggestionDTO>;
  findPending(page?: number, limit?: number): Promise<{ data: SuggestionDTO[], total: number }>;
  findById(id: string): Promise<SuggestionDTO | null>;
  updateStatus(id: string, status: "MERGED" | "REJECTED", reviewerId: string, feedback?: string): Promise<SuggestionDTO>;
}

export class PostgresSuggestionRepository implements ISuggestionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSuggestionInput): Promise<SuggestionDTO> {
    const suggestion = await this.prisma.suggestion.create({
      data: {
        universityId: data.universityId,
        suggestedField: data.suggestedField,
        suggestedValue: data.suggestedValue,
        sourceUrl: data.sourceUrl,
        notes: data.notes,
        status: "PENDING",
      }
    });

    return suggestion as unknown as SuggestionDTO;
  }

  async findPending(page = 1, limit = 20): Promise<{ data: SuggestionDTO[], total: number }> {
    const skip = (page - 1) * limit;

    const [suggestions, total] = await this.prisma.$transaction([
      this.prisma.suggestion.findMany({
        where: { status: "PENDING" },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          university: {
            select: { nameEn: true }
          }
        }
      }),
      this.prisma.suggestion.count({ where: { status: "PENDING" } })
    ]);

    return {
      data: suggestions as unknown as SuggestionDTO[],
      total
    };
  }

  async findById(id: string): Promise<SuggestionDTO | null> {
    const suggestion = await this.prisma.suggestion.findUnique({
      where: { id },
      include: {
        university: {
          select: { nameEn: true }
        }
      }
    });

    return suggestion as unknown as SuggestionDTO | null;
  }

  async updateStatus(id: string, status: "MERGED" | "REJECTED", reviewerId: string, adminNotes?: string): Promise<SuggestionDTO> {
    const suggestion = await this.prisma.suggestion.update({
      where: { id },
      data: {
        status,
        adminNotes,
      }
    });

    return suggestion as unknown as SuggestionDTO;
  }
}

