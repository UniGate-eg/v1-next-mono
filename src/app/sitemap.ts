import type { MetadataRoute } from "next";
import { UniversityRepository } from "@/server/repositories/UniversityRepository";
import { UniversityService } from "@/server/services/UniversityService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unicompass.eg";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/universities`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const repository = new UniversityRepository();
    const service = new UniversityService(repository);
    const result = await service.getUniversities({ page: 1, limit: 100 });

    const universityRoutes: MetadataRoute.Sitemap = result.data.map((uni) => ({
      url: `${baseUrl}/universities/${uni.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...universityRoutes];
  } catch {
    return staticRoutes;
  }
}
