"use client";

import { useState } from "react";
import Link from "next/link";
import { UniversityDTO } from "../../types/university.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Edit, Eye, Filter, Plus, Building2, CheckSquare, Square } from "lucide-react";
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

  const canCreate = hasPermission("universities:create_delete");

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Input
            placeholder="Search universities by EN or AR name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[320px] text-xs"
          />
          <button
            onClick={() => setStaleOnly(!staleOnly)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              staleOnly
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Needs Review
          </button>
        </div>

        {canCreate && (
          <Link href="/admin/universities/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              Add University
            </Button>
          </Link>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedIds.length > 0 && selectedIds.length === filtered.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Institution</th>
                <th className="px-4 py-3.5">Type & Model</th>
                <th className="px-4 py-3.5">Completeness</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No universities found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((uni) => {
                  const isSelected = selectedIds.includes(uni.id);
                  const canEditThis = hasPermission("universities:edit_global") || isScopedTo(uni.id);

                  return (
                    <tr
                      key={uni.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(uni.id)} className="text-slate-400 hover:text-slate-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-1 bg-slate-50 rounded-lg border border-slate-100">{uni.emoji || "🏛️"}</span>
                          <div>
                            <div className="font-bold text-slate-900">{uni.nameEn}</div>
                            <div className="text-[11px] text-slate-500 font-arabic">{uni.nameAr}</div>
                            <div className="mt-1">
                              <StaleBadge updatedAt={(uni as any).updatedAt || new Date()} />
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit text-[10px] font-bold">
                            {uni.type}
                          </Badge>
                          <span className="text-[11px] text-slate-500">{uni.educationModel}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <CompletenessScore score={(uni as any).completenessScore ?? 80} size="md" />
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                            uni.publishStatus === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-700"
                              : uni.publishStatus === "DRAFT"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {uni.publishStatus}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/universities/${uni.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" title="View Public Page">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {canEditThis ? (
                            <Link href={`/admin/universities/${uni.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" title="Edit Profile">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="ghost" size="icon" disabled className="h-8 w-8 text-slate-300" title="Outside Assigned Scope">
                              <Edit className="h-4 w-4" />
                            </Button>
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

      {/* Pagination Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <div>
          Showing {filtered.length} of {total} institutions
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={filtered.length < 20}>
            Next
          </Button>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onSuccess={() => {
          setSelectedIds([]);
          router.refresh();
        }}
      />
    </div>
  );
}
