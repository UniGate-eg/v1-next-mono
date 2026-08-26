"use client";

import { useState } from "react";
import Link from "next/link";
import { UniversityDTO } from "../../types/university.types";
import { Input } from "../ui/input";
import { Edit, Eye, Filter, Plus, Building2, CheckSquare, Square, Search, Sparkles } from "lucide-react";
import { CompletenessScore } from "./shared/CompletenessScore";
import { StaleBadge } from "./shared/StaleBadge";
import { BulkActionBar } from "./shared/BulkActionBar";
import { usePermission } from "../../hooks/usePermission";
import { useRouter } from "next/navigation";

interface UniversityDataTableProps {
  universities: UniversityDTO[];
  total: number;
  currentPage: number;
}

export function UniversityDataTable({ universities, total, currentPage }: UniversityDataTableProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [staleOnly, setStaleOnly] = useState(false);
  const router = useRouter();
  const { hasPermission, isScopedTo } = usePermission();

  const filtered = universities.filter((u) => {
    const matchesSearch =
      u.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      u.nameAr.includes(search);

    const isStale = (u as any).updatedAt ? new Date((u as any).updatedAt) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) : false;
    const matchesStale = !staleOnly || isStale;

    return matchesSearch && matchesStale;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((u) => u.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#101320] p-5 rounded-3xl border border-[#1C2236] shadow-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[360px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              placeholder="Search institutions by English or Arabic name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-xs bg-[#151929] border border-[#222A40] rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => setStaleOnly(!staleOnly)}
            className={`px-4 py-2.5 text-xs font-bold rounded-2xl border transition-colors cursor-pointer ${
              staleOnly
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-[#151929] text-slate-400 border-[#222A40] hover:text-white"
            }`}
          >
            Needs Annual Review
          </button>
        </div>

        <div className="text-xs font-bold text-slate-400">
          Showing {filtered.length} of {total} records
        </div>
      </div>

      {/* Spacious Dark Table */}
      <div className="rounded-3xl border border-[#1C2236] bg-[#101320] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-dark-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-[#0C0E18] border-b border-[#1A2033]">
              <tr>
                <th className="px-5 py-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-500 hover:text-white">
                    {selectedIds.length > 0 && selectedIds.length === filtered.length ? (
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-5 py-4">Institution Name</th>
                <th className="px-5 py-4">Category / Model</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Profile Quality</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B2B] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500 font-medium">
                    No institutions match your search filters.
                  </td>
                </tr>
              ) : (
                filtered.map((uni) => {
                  const isSelected = selectedIds.includes(uni.id);
                  const canEdit = hasPermission("universities:edit_global") || isScopedTo(uni.id);

                  return (
                    <tr
                      key={uni.id}
                      className={`hover:bg-[#14192A] transition-colors ${
                        isSelected ? "bg-[#181630]" : ""
                      }`}
                    >
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => toggleSelect(uni.id)} className="text-slate-500 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-[#181D30] text-purple-300 border border-[#252E48] flex items-center justify-center font-bold text-xs shrink-0">
                            {uni.nameEn.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-white text-xs">{uni.nameEn}</div>
                            <div className="text-[11px] text-slate-400 font-arabic">{uni.nameAr}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        <span className="font-bold text-slate-200">{uni.type}</span>
                        <span className="text-[10px] text-slate-500 ml-1">({uni.educationModel})</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                            uni.publishStatus === "PUBLISHED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : uni.publishStatus === "DRAFT"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {uni.publishStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <CompletenessScore score={(uni as any).completenessScore ?? 80} size="sm" />
                          <StaleBadge updatedAt={(uni as any).updatedAt || new Date()} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/universities/${uni.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-[#161B2B] hover:bg-[#20273D] text-slate-400 hover:text-white transition-colors"
                            title="View Public Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {canEdit && (
                            <Link
                              href={`/admin/universities/${uni.id}/edit`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BulkActionBar
        selectedIds={selectedIds}
        entityType="University"
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
}
