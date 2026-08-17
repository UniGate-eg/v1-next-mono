import { universityRepository } from "../../../../../lib/di";
import { notFound } from "next/navigation";
import { FacultyModal } from "../../../../../components/admin/FacultyModal";
import { Button } from "../../../../../components/ui/button";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Manage Faculties | UniGate Admin",
};

export default async function AdminFacultiesPage({
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Faculties</h2>
          <p className="text-muted-foreground mt-2">
            Manage faculties for {university.nameEn}.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/admin/universities/${university.id}/edit`}>
            <Button variant="outline">Back to University</Button>
          </Link>
          <FacultyModal 
            universityId={university.id} 
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add Faculty
              </Button>
            } 
          />
        </div>
      </div>

      <div className="bg-white rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Faculty Name</th>
              <th className="px-6 py-3">Dean</th>
              <th className="px-6 py-3">Programs</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!university.faculties || university.faculties.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No faculties added yet.
                </td>
              </tr>
            ) : university.faculties.map((faculty) => (
              <tr key={faculty.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div>{faculty.nameEn}</div>
                  <div className="text-xs text-gray-500">{faculty.nameAr}</div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {faculty.deanName || "-"}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {faculty.degreePrograms?.length || 0}
                </td>
                <td className="px-6 py-4 text-right">
                  <FacultyModal 
                    universityId={university.id}
                    faculty={faculty}
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
