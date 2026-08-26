"use client";

import React, { useState } from "react";
import { DegreeProgramDTO, FacultyDTO } from "@/types/university.types";
import {
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from "@/app/admin/actions/program.actions";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  X,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProgramsTabProps {
  universityId: string;
  degreePrograms: DegreeProgramDTO[];
  faculties: FacultyDTO[];
}

export function ProgramsTab({
  universityId,
  degreePrograms,
  faculties,
}: ProgramsTabProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<DegreeProgramDTO | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [facultyId, setFacultyId] = useState<string>("");
  const [degreeType, setDegreeType] = useState("Bachelor");
  const [durationYears, setDurationYears] = useState(4);
  const [studyLanguage, setStudyLanguage] = useState("English");
  const [tuitionEgp, setTuitionEgp] = useState<number | "">("");
  const [tuitionUsd, setTuitionUsd] = useState<number | "">("");
  const [dualPartner, setDualPartner] = useState("");

  const openCreateModal = () => {
    setEditingProgram(null);
    setNameEn("");
    setNameAr("");
    setSlug("");
    setFacultyId(faculties[0]?.id || "");
    setDegreeType("Bachelor");
    setDurationYears(4);
    setStudyLanguage("English");
    setTuitionEgp("");
    setTuitionUsd("");
    setDualPartner("");
    setIsModalOpen(true);
  };

  const openEditModal = (prog: DegreeProgramDTO) => {
    setEditingProgram(prog);
    setNameEn(prog.nameEn);
    setNameAr(prog.nameAr);
    setSlug(prog.slug);
    setFacultyId(prog.facultyId || "");
    setDegreeType(prog.degreeType);
    setDurationYears(prog.durationYears);
    setStudyLanguage(prog.studyLanguage);
    setTuitionEgp(prog.tuitionEgpPerYear ?? "");
    setTuitionUsd(prog.tuitionUsdPerYear ?? "");
    setDualPartner(prog.dualDegreePartner || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr) {
      toast.error("English and Arabic program names are required");
      return;
    }

    const computedSlug = slug || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    setLoading(true);
    try {
      if (editingProgram) {
        const res = await updateProgramAction(editingProgram.id, {
          id: editingProgram.id,
          nameEn,
          nameAr,
          facultyId: facultyId || undefined,
          degreeType,
          durationYears: Number(durationYears),
          studyLanguage,
          tuitionEgpPerYear: tuitionEgp !== "" ? Number(tuitionEgp) : undefined,
          tuitionUsdPerYear: tuitionUsd !== "" ? Number(tuitionUsd) : undefined,
          dualDegreePartner: dualPartner || undefined,
        });

        if (res.success) {
          toast.success("Degree program updated");
          setIsModalOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update program");
        }
      } else {
        const res = await createProgramAction({
          universityId,
          slug: computedSlug,
          nameEn,
          nameAr,
          facultyId: facultyId || undefined,
          degreeType,
          durationYears: Number(durationYears),
          studyLanguage,
          careerOpportunities: [],
          tuitionEgpPerYear: tuitionEgp !== "" ? Number(tuitionEgp) : undefined,
          tuitionUsdPerYear: tuitionUsd !== "" ? Number(tuitionUsd) : undefined,
          dualDegreePartner: dualPartner || undefined,
        });

        if (res.success) {
          toast.success("Degree program added");
          setIsModalOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to add program");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (progId: string, progName: string) => {
    if (!confirm(`Are you sure you want to delete the program "${progName}"?`)) return;

    setLoading(true);
    try {
      const res = await deleteProgramAction(progId);
      if (res.success) {
        toast.success("Program deleted");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete program");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = degreePrograms.filter((p) => {
    const matchesSearch =
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.nameAr.includes(search);

    const matchesFaculty =
      selectedFacultyFilter === "ALL" || p.facultyId === selectedFacultyFilter;

    return matchesSearch && matchesFaculty;
  });

  return (
    <div className="space-y-6">
      {/* Filter & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedFacultyFilter}
            onChange={(e) => setSelectedFacultyFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="ALL">All Colleges / Faculties</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nameEn}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Degree Program</span>
        </button>
      </div>

      {/* Programs Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-dark-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Program Name</th>
                <th className="py-4 px-6">College / Faculty</th>
                <th className="py-4 px-6">Type & Duration</th>
                <th className="py-4 px-6">Tuition per Year</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">
                    <GraduationCap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No degree programs found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Add Degree Program" to configure majors and admission tracks.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prog) => {
                  const assignedFaculty = faculties.find((f) => f.id === prog.facultyId);

                  return (
                    <tr
                      key={prog.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">
                              {prog.nameEn}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-arabic">
                              {prog.nameAr}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {assignedFaculty ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium text-xs">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{assignedFaculty.nameEn}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                            {prog.degreeType}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {prog.durationYears} Years • {prog.studyLanguage}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {prog.tuitionEgpPerYear ? (
                          <span className="font-bold text-slate-900 dark:text-white">
                            {prog.tuitionEgpPerYear.toLocaleString()} EGP
                          </span>
                        ) : prog.tuitionUsdPerYear ? (
                          <span className="font-bold text-slate-900 dark:text-white">
                            ${prog.tuitionUsdPerYear.toLocaleString()} USD
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Contact University</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prog)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            title="Edit Program"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prog.id, prog.nameEn)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Program"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Program Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {editingProgram ? "Edit Degree Program" : "Add Degree Program"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure curriculum, tuition, and duration parameters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Program Name (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="B.Sc. in Computer Science"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Program Name (AR) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="بكالوريوس علوم الحاسب"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Assigned Faculty / College
                  </label>
                  <select
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None / General</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Degree Level
                  </label>
                  <select
                    value={degreeType}
                    onChange={(e) => setDegreeType(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Language
                  </label>
                  <input
                    type="text"
                    value={studyLanguage}
                    onChange={(e) => setStudyLanguage(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tuition (EGP/Yr)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={tuitionEgp}
                    onChange={(e) => setTuitionEgp(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dual Degree International Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. University of East London (UK)"
                  value={dualPartner}
                  onChange={(e) => setDualPartner(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProgram ? "Save Changes" : "Create Program"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
