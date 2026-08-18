import { UniversityForm } from "../../../../components/admin/UniversityForm";

export const metadata = {
  title: "Add University | UniGate Admin",
};

export default function NewUniversityPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Add University</h2>
        <p className="text-muted-foreground mt-2">
          Create a new university profile.
        </p>
      </div>

      <UniversityForm />
    </div>
  );
}
