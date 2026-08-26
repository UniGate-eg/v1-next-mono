"use client";

import React from "react";
import { PermissionDTO } from "../../../types/role.types";
import { Check } from "lucide-react";

export interface PermissionGridProps {
  allPermissions: PermissionDTO[];
  selectedCodes: string[];
  onChange?: (codes: string[]) => void;
  disabled?: boolean;
}

export function PermissionGrid({
  allPermissions,
  selectedCodes,
  onChange,
  disabled = false,
}: PermissionGridProps) {
  const domains = Array.from(new Set(allPermissions.map((p) => p.domain)));

  const handleToggle = (code: string) => {
    if (disabled || !onChange) return;
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter((c) => c !== code));
    } else {
      onChange([...selectedCodes, code]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {domains.map((domain) => {
        const domainPerms = allPermissions.filter((p) => p.domain === domain);
        return (
          <div
            key={domain}
            className="bg-[#101320] rounded-3xl border border-[#1C2236] p-6 shadow-2xl space-y-4"
          >
            <div className="border-b border-[#1A2033] pb-3 flex items-center justify-between">
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                Domain: {domain}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {domainPerms.length} capabilities
              </span>
            </div>

            <div className="space-y-2.5">
              {domainPerms.map((p) => {
                const isChecked = selectedCodes.includes(p.code);

                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggle(p.code)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                      disabled
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${
                      isChecked
                        ? "bg-[#161C30] border-[#2A375B] text-white shadow-md shadow-purple-500/5"
                        : "bg-[#0D0F1A] border-[#181D30] text-slate-400 hover:border-[#242D46]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? "bg-purple-600 text-white"
                          : "bg-[#181D30] border border-[#262E48]"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white font-mono">{p.code}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{p.description}</p>
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
