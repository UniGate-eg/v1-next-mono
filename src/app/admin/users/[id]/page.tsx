import { userRepository, roleRepository, universityRepository } from "../../../../lib/di";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building, KeyRound, ShieldCheck } from "lucide-react";
import { RoleAssignmentSheet } from "../../../../components/admin/users/RoleAssignmentSheet";
import { UserStatusToggle } from "../../../../components/admin/users/UserStatusToggle";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await userRepository.findAdminUserById(id);
  if (!user) notFound();

  const roles = await roleRepository.findAll();
  const universitiesResult = await universityRepository.findMany(undefined, 1, 150);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>

        <div className="flex items-center gap-2">
          <UserStatusToggle userId={user.id} currentStatus={user.status} userName={user.name} />
          <RoleAssignmentSheet
            user={user}
            availableRoles={roles}
            availableUniversities={universitiesResult.data.map(u => ({ id: u.id, nameEn: u.nameEn, nameAr: u.nameAr }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shadow-blue-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="text-[11px] text-slate-400 mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="font-semibold text-slate-500">Account ID:</span>
            <p className="font-mono text-slate-800 mt-0.5">{user.id}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Legacy Role:</span>
            <p className="font-mono text-slate-800 mt-0.5">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Active Roles Detail */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-600" /> Active Role Permissions
        </h3>

        {user.roles.length === 0 ? (
          <p className="text-xs text-slate-500">No admin roles assigned to this account.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.roles.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{r.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-200 text-slate-700">
                    Hierarchy {r.hierarchyLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{r.description || "No description provided."}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
