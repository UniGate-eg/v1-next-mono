import { roleRepository, permissionRepository } from "../../../../lib/di";
import { notFound } from "next/navigation";
import { RoleEditor } from "../../../../components/admin/roles/RoleEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function RoleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";

  const allPermissions = await permissionRepository.findAll();
  const role = !isNew ? await roleRepository.findById(id) : undefined;

  if (!isNew && !role) notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/admin/roles"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Roles
      </Link>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {isNew ? "Define Custom Dynamic Role" : `Configure Role: ${role?.name}`}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Custom dynamic roles take effect immediately upon assignment across all active sessions.
        </p>
      </div>

      <RoleEditor initialRole={role || undefined} allPermissions={allPermissions} />
    </div>
  );
}
