"use client";

import React, { useState } from "react";
import { RoleDTO } from "../../../types/role.types";
import { AdminUserDTO } from "../../../types/user.types";
import {
  promoteUserAction,
  revokeUserRoleAction,
} from "../../../server/actions/admin/user.admin.actions";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  Building,
  X,
  Shield,
  KeyRound,
  Check,
  Search,
} from "lucide-react";

interface RoleAssignmentSheetProps {
  user: AdminUserDTO;
  availableRoles: RoleDTO[];
  availableUniversities: Array<{ id: string; nameEn: string; nameAr: string }>;
}

export function RoleAssignmentSheet({
  user,
  availableRoles,
  availableUniversities,
}: RoleAssignmentSheetProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(availableRoles[0]?.id || "");
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState("");

  const selectedRole = availableRoles.find((r) => r.id === selectedRoleId);
  const isScopedRole = selectedRole?.key === "UNIVERSITY_REP";

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;

    try {
      setLoading(true);
      const res = await promoteUserAction({
        userId: user.id,
        roleId: selectedRoleId,
        universityIds: selectedUniversities,
      });

      if (!res.success) {
        alert(res.error || "Failed to assign role");
      } else {
        setSelectedUniversities([]);
        setIsOpen(false);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (roleId: string) => {
    if (!confirm("Are you sure you want to revoke this role from the user?")) return;
    try {
      setLoading(true);
      const res = await revokeUserRoleAction({ userId: user.id, roleId });
      if (!res.success) {
        alert(res.error || "Failed to revoke role");
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUniversity = (id: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredUniversities = availableUniversities.filter(
    (u) =>
      u.nameEn.toLowerCase().includes(uniSearch.toLowerCase()) ||
      u.nameAr.includes(uniSearch)
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <KeyRound className="w-3.5 h-3.5" />
        <span>Manage Roles</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Role & Scope Authority
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {user.name} • <span className="font-mono text-slate-400">{user.email}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Active Roles Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Active Assigned Roles
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {user.roles.length} Active
                  </span>
                </div>

                {user.roles.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No elevated administrative roles assigned (Base Student access)
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.roles.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {r.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Key: <code className="font-mono text-purple-600 dark:text-purple-400">{r.key}</code>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRevoke(r.id)}
                          disabled={loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign New Role Form */}
              <form onSubmit={handleAssign} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Grant New Authority
                </h4>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Select Target Role
                  </label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.key})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scoped Role University Selector */}
                {isScopedRole && (
                  <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Building className="w-3.5 h-3.5 text-amber-500" />
                        <span>Institutional Scopes</span>
                      </label>
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {selectedUniversities.length} Selected
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search universities by name..."
                        value={uniSearch}
                        onChange={(e) => setUniSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-dark-scrollbar">
                      {filteredUniversities.map((u) => {
                        const isChecked = selectedUniversities.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => toggleUniversity(u.id)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-amber-500/10 text-amber-800 dark:text-amber-200 font-semibold border border-amber-500/30"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span>{u.nameEn}</span>
                            {isChecked && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedRoleId}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Grant Role Authority</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
