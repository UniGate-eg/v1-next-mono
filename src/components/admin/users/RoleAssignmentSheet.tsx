"use client";

import React, { useState } from "react";
import { RoleDTO } from "../../../types/role.types";
import { AdminUserDTO } from "../../../types/user.types";
import { promoteUserAction, revokeUserRoleAction } from "../../../server/actions/admin/user.admin.actions";
import { ShieldCheck, Plus, Trash2, Loader2, Building } from "lucide-react";

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
    if (!confirm("Are you sure you want to revoke this role?")) return;
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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5" /> Manage Roles
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Role & Scope Governance</h3>
                <p className="text-xs text-slate-500">{user.name} ({user.email})</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Current Active Roles */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Role Assignments</h4>
              {user.roles.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                  No administrative roles assigned (Student baseline)
                </div>
              ) : (
                <div className="space-y-2">
                  {user.roles.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{r.name}</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-200 text-slate-700">
                            Level {r.hierarchyLevel}
                          </span>
                        </div>
                        {user.assignedUniversities && user.assignedUniversities.length > 0 && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>Scoped to: {user.assignedUniversities.map((u) => u.nameEn).join(", ")}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRevoke(r.id)}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Revoke role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign New Role Form */}
            <form onSubmit={handleAssign} className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Grant Role & Scope</h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Select Role</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {availableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Hierarchy: {r.hierarchyLevel}) {r.isSystemDefault ? "• Built-in" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Institution Scope Multi-select */}
              {isScopedRole && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Assign Institution Scope (University Rep)
                  </label>
                  <select
                    multiple
                    value={selectedUniversities}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                      setSelectedUniversities(selected);
                    }}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 h-28 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {availableUniversities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameEn} ({u.nameAr})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">Hold Ctrl (Windows) to select multiple institutions.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-colors"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
