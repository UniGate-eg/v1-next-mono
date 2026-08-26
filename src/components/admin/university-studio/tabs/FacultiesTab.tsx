"use client";

import React, { useState } from "react";
import { FacultyDTO } from "@/types/university.types";
import {
  createFacultyAction,
  updateFacultyAction,
  deleteFacultyAction,
} from "@/app/admin/actions/faculty.actions";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  GraduationCap,
  User,
  Layers,
  Search,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FacultiesTabProps {
  universityId: string;
  faculties: FacultyDTO[];
}

export function FacultiesTab({ universityId, faculties }: FacultiesTabProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyDTO | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [deanName, setDeanName] = useState("");
  const [departmentsInput, setDepartmentsInput] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");

  const openCreateModal = () => {
    setEditingFaculty(null);
    setNameEn("");
    setNameAr("");
    setDeanName("");
    setDepartmentsInput("");
    setDescriptionEn("");
    setDescriptionAr("");
    setIsModalOpen(true);
  };

  const openEditModal = (faculty: FacultyDTO) => {
    setEditingFaculty(faculty);
    setNameEn(faculty.nameEn);
    setNameAr(faculty.nameAr);
    setDeanName(faculty.deanName || "");
    setDepartmentsInput((faculty.departments || []).join(", "));
    setDescriptionEn(faculty.descriptionEn || "");
    setDescriptionAr(faculty.descriptionAr || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr) {
      toast.error("English and Arabic faculty names are required");
      return;
    }

    const departments = departmentsInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      if (editingFaculty) {
        const res = await updateFacultyAction(editingFaculty.id, {
          id: editingFaculty.id,
          nameEn,
          nameAr,
          deanName: deanName || undefined,
          departments,
          descriptionEn: descriptionEn || undefined,
          descriptionAr: descriptionAr || undefined,
        });

        if (res.success) {
          toast.success("Faculty updated successfully");
          setIsModalOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update faculty");
        }
      } else {
        const res = await createFacultyAction({
          universityId,
          nameEn,
          nameAr,
          deanName: deanName || undefined,
          departments,
          descriptionEn: descriptionEn || undefined,
          descriptionAr: descriptionAr || undefined,
        });

        if (res.success) {
          toast.success("Faculty added successfully");
          setIsModalOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to add faculty");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (facultyId: string, facultyName: string) => {
    if (!confirm(`Are you sure you want to delete "${facultyName}"? Attached programs will be unlinked.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteFacultyAction(facultyId);
      if (res.success) {
        toast.success("Faculty deleted");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete faculty");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculties = faculties.filter(
    (f) =>
      f.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      f.nameAr.includes(search) ||
      (f.deanName && f.deanName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search & Add Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculties by name or dean..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Faculty</span>
        </button>
      </div>

      {/* Faculties Cards Grid */}
      {filteredFaculties.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm text-slate-400">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No faculties configured yet
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click "Add New Faculty" to organize this institution into colleges and departments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaculties.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {f.nameEn}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic">
                        {f.nameAr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(f)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      title="Edit Faculty"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(f.id, f.nameEn)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {f.deanName && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dean: {f.deanName}</span>
                  </div>
                )}

                {f.departments && f.departments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {f.departments.map((dept: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {f.descriptionEn && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {f.descriptionEn}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Faculty Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {editingFaculty ? "Edit Faculty" : "Add Faculty"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure institutional college profile & leadership
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Faculty Name (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Faculty of Engineering"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Faculty Name (AR) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="كلية الهندسة"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-arabic"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dean / Head of College
                </label>
                <input
                  type="text"
                  placeholder="Prof. Dr. Ahmed Mahmoud"
                  value={deanName}
                  onChange={(e) => setDeanName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Academic Departments (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Computer Science, Mechanical, Civil, Electrical"
                  value={departmentsInput}
                  onChange={(e) => setDepartmentsInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description / Overview (EN)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief college overview..."
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
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
                  <span>{editingFaculty ? "Save Changes" : "Create Faculty"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
