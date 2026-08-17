import { IUniversityReader, IUniversityWriter } from "./interfaces/IUniversityRepository";
import { UniversityDTO, SlimSearchToken, UniversityFilters } from "../../types/university.types";
import { CreateUniversityInput, UpdateUniversityInput } from "../../schemas/university.schema";
import { UniversityMapper } from "../mappers/UniversityMapper";
import { PrismaClient, Prisma } from "@prisma/client";

export class PostgresUniversityRepository implements IUniversityReader, IUniversityWriter {
  constructor(private prisma: PrismaClient) {}

  async findMany(filters?: UniversityFilters, page = 1, limit = 10): Promise<{ data: UniversityDTO[], total: number }> {
    const where: Prisma.UniversityWhereInput = {
      ...(filters?.governorate && { governorate: filters.governorate }),
      ...(filters?.type && { type: filters.type as any }),
      ...(filters?.educationModel && { educationModel: filters.educationModel as any }),
      ...(filters?.degreeType && {
        degreePrograms: {
          some: {
            degreeType: filters.degreeType
          }
        }
      })
    };

    const skip = (page - 1) * limit;

    const [universities, total] = await this.prisma.$transaction([
      this.prisma.university.findMany({
        where,
        skip,
        take: limit,
        include: {
          faculties: true,
          degreePrograms: true,
          accreditations: true
        }
      }),
      this.prisma.university.count({ where })
    ]);

    return {
      data: universities.map(UniversityMapper.toDTO),
      total
    };
  }

  async findBySlug(slug: string): Promise<UniversityDTO | null> {
    const university = await this.prisma.university.findUnique({
      where: { slug },
      include: {
        faculties: {
          include: {
            degreePrograms: true
          }
        },
        degreePrograms: true,
        accreditations: true
      }
    });

    return university ? UniversityMapper.toDTO(university) : null;
  }

  async findById(id: string): Promise<UniversityDTO | null> {
    const university = await this.prisma.university.findUnique({
      where: { id },
      include: {
        faculties: true,
        degreePrograms: true,
        accreditations: true
      }
    });

    return university ? UniversityMapper.toDTO(university) : null;
  }

  async findForSearch(): Promise<SlimSearchToken[]> {
    const universities = await this.prisma.university.findMany({
      where: { publishStatus: "PUBLISHED" },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        shortName: true,
        type: true,
        emoji: true,
        city: true,
        governorate: true,
        educationModel: true,
        established: true,
        overviewEn: true,
        overviewAr: true,
        qsRanking: true,
        theRanking: true,
        strengthsEn: true,
        strengthsAr: true,
        faculties: {
          select: {
            nameEn: true,
            nameAr: true,
          },
        },
      },
    });

    return universities.map(UniversityMapper.toSlimSearchToken);
  }

  async create(data: CreateUniversityInput): Promise<UniversityDTO> {
    const university = await this.prisma.university.create({
      data: {
        slug: data.slug,
        shortName: data.shortName,
        emoji: data.emoji,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        educationModel: data.educationModel as any,
        type: data.type as any,
        governorate: data.governorate,
        city: data.city,
        addressEn: data.addressEn,
        addressAr: data.addressAr,
        overviewEn: data.overviewEn,
        overviewAr: data.overviewAr,
        website: data.website,
        logoUrl: data.logoUrl,
        established: data.established,
        qsRanking: data.qsRanking,
        theRanking: data.theRanking,
        phones: data.phones,
        emails: data.emails,
        socialLinks: data.socialLinks || Prisma.JsonNull,
        strengthsEn: data.strengthsEn,
        strengthsAr: data.strengthsAr,
        publishStatus: data.publishStatus as any,
      },
      include: {
        faculties: true,
        degreePrograms: true,
        accreditations: true
      }
    });

    return UniversityMapper.toDTO(university);
  }

  async update(id: string, data: UpdateUniversityInput): Promise<UniversityDTO> {
    const { id: _ignore, ...updateData } = data;
    const university = await this.prisma.university.update({
      where: { id },
      data: {
        ...updateData,
        socialLinks: updateData.socialLinks !== undefined ? (updateData.socialLinks || Prisma.JsonNull) : undefined
      } as any,
      include: {
        faculties: true,
        degreePrograms: true,
        accreditations: true
      }
    });

    return UniversityMapper.toDTO(university);
  }

  async archive(id: string): Promise<void> {
    await this.prisma.university.update({
      where: { id },
      data: { publishStatus: "ARCHIVED" }
    });
  }

  async publish(id: string): Promise<void> {
    await this.prisma.university.update({
      where: { id },
      data: { publishStatus: "PUBLISHED" }
    });
  }
}
