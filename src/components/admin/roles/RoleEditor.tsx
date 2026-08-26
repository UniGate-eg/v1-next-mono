"use client";

import React, { useState } from "react";
import { PermissionDTO, RoleWithPermissionsDTO } from "../../../types/role.types";
import { PermissionGrid } from "./PermissionGrid";
import { createRoleAction, updateRoleAction } from "../../../server/actions/admin/role.admin.actions";
import { ShieldCheck, Plus, Save, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoleEditorProps {
  initialRole?: RoleWithPermissionsDTO;
  allPermissions: PermissionDTO[];
}

export function RoleEditor({ initialRole, allPermissions }: RoleEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialRole);

  const [key, setKey] = useState(initialRole?.key || "");
  const [name, setName] = useState(initialRole?.name || "");
  const [description, setDescription] = useState(initialRole?.description || "");
  const [hierarchyLevel, setHierarchyLevel] = useState(initialRole?.hierarchyLevel || 50);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(
    initialRole?.permissions.map((p) => p.code) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditing && initialRole) {
        const res = await updateRoleAction({
          id: initialRole.id,
          name,
          description,
          hierarchyLevel,
          permissionCodes: selectedCodes,
        });
        if (!res.success) {
          setError(res.error || "Failed to update role");
        } else {
          router.push("/admin/roles");
          router.refresh();
        }
      } else {
        const res = await createRoleAction({
          key,
          name,
          description,
          hierarchyLevel,
          permissionCodes: selectedCodes,
        });
        if (!res.success) {
          setError(res.error || "Failed to create role");
        } else {
          router.push("/admin/roles");
          router.refresh();
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Role Key (Unique Identifier)</label>
          <input
            type="text"
            placeholder="e.g. ADMISSIONS_OFFICER"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
            disabled={isEditing}
            required
            className="w-full text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
          />
          <p className="text-[11px] text-slate-400">UPPERCASE alphanumeric and underscores only.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Display Name</label>
          <input
            type="text"
            placeholder="e.g. Admissions Officer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Description</label>
          <textarea
            placeholder="Describe the operational responsibilities of this role..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Hierarchy Level (Authority Bound)
          </label>
          <input
            type="number"
            min={1}
            max={999}
            value={hierarchyLevel}
            onChange={(e) => setHierarchyLevel(Number(e.target.value))}
            disabled={initialRole?.isSystemDefault}
            required
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
          />
          <p className="text-[11px] text-slate-400">
            Lower numbers = Higher power (0 = Super Admin). Users cannot manage roles with equal or lower levels.
          </p>
        </div>
      </div>

      {/* Permission Grid Matrix */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Assigned Capabilities & Permissions</h3>
            <p className="text-xs text-slate-500">Toggle the granular capabilities granted to users with this role.</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            {selectedCodes.length} Permissions Selected
          </span>
        </div>

        <PermissionGrid
          allPermissions={allPermissions}
          selectedCodes={selectedCodes}
          onChange={setSelectedCodes}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.push("/admin/roles")}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEditing ? (
            <Save className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isEditing ? "Save Role Changes" : "Create Dynamic Role"}
        </button>
      </div>
    </form>
  );
}
