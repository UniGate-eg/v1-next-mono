import { userRepository, roleRepository, universityRepository } from "../../../lib/di";
import { UserTable } from "../../../components/admin/users/UserTable";
import { Users, Sparkles } from "lucide-react";

export default async function AdminUsersPage() {
  const usersResult = await userRepository.findMany(undefined, 1, 100);
  const roles = await roleRepository.findAll();
  const universitiesResult = await universityRepository.findMany(undefined, 1, 150);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> User Governance & Role Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search registered users, assign dynamic role permissions, configure institution scopes, and enforce hierarchical safeguards.
          </p>
        </div>
      </div>

      <UserTable
        initialUsers={usersResult.data}
        roles={roles}
        universities={universitiesResult.data.map(u => ({ id: u.id, nameEn: u.nameEn, nameAr: u.nameAr }))}
      />
    </div>
  );
}
