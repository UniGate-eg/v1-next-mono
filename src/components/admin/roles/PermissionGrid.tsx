"use client";

import React from "react";
import { PermissionDTO } from "../../../types/role.types";
import { Shield, CheckSquare, Square } from "lucide-react";

interface PermissionGridProps {
  allPermissions: PermissionDTO[];
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
}

export function PermissionGrid({
  allPermissions,
  selectedCodes,
  onChange,
  disabled = false,
}: PermissionGridProps) {
  // Group by domain
  const domains = Array.from(new Set(allPermissions.map((p) => p.domain)));

  const togglePermission = (code: string) => {
    if (disabled) return;
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter((c) => c !== code));
    } else {
      onChange([...selectedCodes, code]);
    }
  };

  const toggleDomain = (domain: string) => {
    if (disabled) return;
    const domainCodes = allPermissions.filter((p) => p.domain === domain).map((p) => p.code);
    const allSelected = domainCodes.every((c) => selectedCodes.includes(c));

    if (allSelected) {
      onChange(selectedCodes.filter((c) => !domainCodes.includes(c)));
    } else {
      const merged = Array.from(new Set([...selectedCodes, ...domainCodes]));
      onChange(merged);
    }
  };

  return (
    <div className="space-y-6">
      {domains.map((domain) => {
        const domainPerms = allPermissions.filter((p) => p.domain === domain);
        const allSelected = domainPerms.every((p) => selectedCodes.includes(p.code));

        return (
          <div key={domain} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {domain} Domain
                </h4>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                >
                  {allSelected ? "Deselect Domain" : "Select All"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {domainPerms.map((perm) => {
                const isChecked = selectedCodes.includes(perm.code);

                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.code)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isChecked
                        ? "bg-white border-blue-500 shadow-xs ring-1 ring-blue-500/20"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                    } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="mt-0.5 text-blue-600">
                      {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-slate-900">{perm.code}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {perm.description || `Capability to ${perm.action} in ${perm.domain}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
