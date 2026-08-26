import { userRepository, roleRepository, universityRepository } from "../../../lib/di";
import { UserTable } from "../../../components/admin/users/UserTable";
import { Users, Sparkles, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Governance | UniGate Admin",
};

export default async function AdminUsersPage() {
  const usersResult = await userRepository.findMany(undefined, 1, 100);
  const roles = await roleRepository.findAll();
  const universitiesResult = await universityRepository.findMany(undefined, 1, 150);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="rounded-3xl bg-[#101320] border border-[#1C2236] p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff Governance & RBAC</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            User Authority & Access Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Assign dynamic roles, manage institutional scoped permissions, enforce hierarchy constraints, and toggle suspension status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl bg-[#151929] text-slate-300 text-xs font-bold border border-[#232A3E]">
            {usersResult.total} Total Registered
          </span>
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
