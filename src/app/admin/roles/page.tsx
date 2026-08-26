import { roleRepository, permissionRepository } from "../../../lib/di";
import { RoleEditor } from "../../../components/admin/roles/RoleEditor";
import { KeyRound, Sparkles, ShieldAlert, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Roles & RBAC Matrix | UniGate Admin",
};

export default async function AdminRolesPage() {
  const roles = await roleRepository.findAll();
  const permissions = await permissionRepository.findAll();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Spacious Dark Header Banner */}
      <div className="rounded-3xl bg-[#101320] border border-[#1C2236] p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Dynamic Capability Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Dynamic Roles & Access Control
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Configure system and custom roles, map capability permissions, and assign hierarchical authority tiers.
          </p>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-3xl bg-[#101320] border border-[#1C2236] p-6 shadow-2xl flex flex-col justify-between space-y-6 hover:border-purple-500/40 transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    role.key === "SUPER_ADMIN"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : role.key === "ADMIN"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      : "bg-[#181D30] text-slate-300 border border-[#252E46]"
                  }`}
                >
                  {role.key}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Level {role.hierarchyLevel}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                {role.name}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {role.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#181D30] flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">
                {role.permissions.length} capabilities granted
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {role.isSystemDefault ? "System Default" : "Custom"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Role Component */}
      <div className="rounded-3xl bg-[#101320] border border-[#1C2236] p-8 shadow-2xl space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-white">Create or Configure Role</h3>
          <p className="text-xs text-slate-400">Add dynamic roles and toggle individual domain permissions.</p>
        </div>
        <RoleEditor allPermissions={permissions} />
      </div>
    </div>
  );
}
