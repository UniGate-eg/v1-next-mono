import { userRepository, roleRepository, universityRepository } from "../../../lib/di";
import { UserTable } from "../../../components/admin/users/UserTable";
import { ShieldCheck, Users, Shield, Building, UserX } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Authority & Access Matrix | UniGate Admin",
  description: "Granular RBAC role assignment, institutional scopes, and staff security controls.",
};

export default async function AdminUsersPage() {
  const usersResult = await userRepository.findMany(undefined, 1, 150);
  const roles = await roleRepository.findAll();
  const universitiesResult = await universityRepository.findMany(undefined, 1, 150);

  const totalUsers = usersResult.total || usersResult.data.length;
  const staffUsers = usersResult.data.filter((u) => u.roles.length > 0);
  const superAdmins = usersResult.data.filter((u) =>
    u.roles.some((r) => r.key === "SUPER_ADMIN")
  );
  const scopedReps = usersResult.data.filter((u) => u.assignedUniversityIds.length > 0);
  const suspendedUsers = usersResult.data.filter((u) => u.status === "SUSPENDED");

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ── Header & Greeting ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>RBAC Security Matrix</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Access Control Protocol
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Governance & Authority
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage administrative operators, assign granular dynamic roles, enforce institutional delegate boundaries, and govern active session states.
          </p>
        </div>
      </div>

      {/* ── 4 Key Telemetry Metric Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Users */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <Users className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Total Accounts
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {totalUsers}
            </p>
          </div>
        </div>

        {/* Elevated Staff */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Active Operators
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {staffUsers.length}
            </p>
          </div>
        </div>

        {/* Scoped Delegates */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Building className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Scoped Reps
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {scopedReps.length}
            </p>
          </div>
        </div>

        {/* Super Admins / Suspended */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
            <UserX className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              Quarantined
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {suspendedUsers.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Interactive User Table ────────────────────────────────── */}
      <UserTable
        initialUsers={usersResult.data}
        roles={roles}
        universities={universitiesResult.data.map((u) => ({
          id: u.id,
          nameEn: u.nameEn,
          nameAr: u.nameAr,
        }))}
      />
    </div>
  );
}
