import { UniversityForm } from "../../../../../components/admin/UniversityForm";
import { universityRepository } from "../../../../../lib/di";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit University | UniGate Admin",
};

export default async function EditUniversityPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const university = await universityRepository.findById(id);

  if (!university) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Edit University</h2>
        <p className="text-muted-foreground mt-2">
          Update the profile for {university.nameEn}.
        </p>
      </div>

      <UniversityForm initialData={university} isEdit />
    </div>
  );
}
