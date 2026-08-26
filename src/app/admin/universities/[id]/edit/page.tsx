import { universityRepository } from "../../../../../lib/di";
import { notFound } from "next/navigation";
import { UniversityStudio } from "../../../../../components/admin/university-studio/UniversityStudio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit University Studio | UniGate Admin",
  description: "Comprehensive institutional governance, college departments, and degree program curricula management.",
};

export default async function EditUniversityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const university = await universityRepository.findById(id);

  if (!university) {
    notFound();
  }

  return <UniversityStudio university={university} />;
}
