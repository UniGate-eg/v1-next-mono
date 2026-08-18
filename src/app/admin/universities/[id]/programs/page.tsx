import { universityRepository } from "../../../../../lib/di";
import { notFound } from "next/navigation";
import { ProgramModal } from "../../../../../components/admin/ProgramModal";
import { Button } from "../../../../../components/ui/button";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import { Badge } from "../../../../../components/ui/badge";

export const metadata = {
  title: "Manage Degree Programs | UniGate Admin",
};

export default async function AdminProgramsPage({
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Degree Programs</h2>
          <p className="text-muted-foreground mt-2">
            Manage degree programs and tuitions for {university.nameEn}.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/admin/universities/${university.id}/edit`}>
            <Button variant="outline">Back to University</Button>
          </Link>
          <ProgramModal 
            universityId={university.id} 
            faculties={university.faculties || []}
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add Program
              </Button>
            } 
          />
        </div>
      </div>

      <div className="bg-white rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Program Name</th>
              <th className="px-6 py-3">Faculty</th>
              <th className="px-6 py-3">Degree Type</th>
              <th className="px-6 py-3">Tuition</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!university.degreePrograms || university.degreePrograms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No programs added yet.
                </td>
              </tr>
            ) : university.degreePrograms.map((program) => {
              const faculty = university.faculties?.find(f => f.id === program.facultyId);
              
              return (
                <tr key={program.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div>{program.nameEn}</div>
                    <div className="text-xs text-gray-500">{program.nameAr}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {faculty ? faculty.nameEn : <span className="italic text-gray-400">None</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{program.degreeType}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {program.tuitionEgpPerYear ? (
                      <div>{program.tuitionEgpPerYear.toLocaleString()} EGP</div>
                    ) : null}
                    {program.tuitionUsdPerYear ? (
                      <div className="text-xs">{program.tuitionUsdPerYear.toLocaleString()} USD</div>
                    ) : null}
                    {!program.tuitionEgpPerYear && !program.tuitionUsdPerYear && "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ProgramModal 
                      universityId={university.id}
                      faculties={university.faculties || []}
                      program={program}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
