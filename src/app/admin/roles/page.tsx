import { roleRepository, permissionRepository } from "../../../lib/di";
import Link from "next/link";
import { KeyRound, Plus, ShieldCheck, Lock } from "lucide-react";

export default async function AdminRolesPage() {
  const roles = await roleRepository.findAll();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-600" /> Dynamic Role & Permission Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure system authority levels, toggle permission matrices, and define custom operational roles without code changes.
          </p>
        </div>

        <Link
          href="/admin/roles/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Define New Role
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{role.name}</span>
                  {role.isSystemDefault && (
                    <span className="p-1 text-slate-400" title="Core System Default Role">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-100 text-slate-700">
                  Level {role.hierarchyLevel}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                {role.description || "No description provided."}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {role.permissions.slice(0, 4).map((p) => (
                  <span
                    key={p.id}
                    className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-50 text-slate-600 border border-slate-200"
                  >
                    {p.code}
                  </span>
                ))}
                {role.permissions.length > 4 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                    +{role.permissions.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400">
                {role.userCount ?? 0} user(s) assigned
              </span>
              <Link
                href={`/admin/roles/${role.id}`}
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Configure &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
