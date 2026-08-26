"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useZodForm } from "../../hooks/useZodForm";
import { CreateUniversitySchema, UpdateUniversitySchema } from "../../schemas/university.schema";
import { createUniversityAction, updateUniversityAction } from "../../app/admin/actions/university.actions";
import { UniversityDTO } from "../../types/university.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { CompletenessScore } from "./shared/CompletenessScore";
import { StaleBadge } from "./shared/StaleBadge";

interface UniversityFormProps {
  initialData?: UniversityDTO;
  isEdit?: boolean;
}

export function UniversityForm({ initialData, isEdit }: UniversityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useZodForm({
    schema: isEdit ? UpdateUniversitySchema : CreateUniversitySchema,
    defaultValues: (initialData as any) || {
      slug: "",
      nameEn: "",
      nameAr: "",
      emoji: "🏛️",
      type: "PUBLIC",
      educationModel: "EGYPTIAN",
      governorate: "",
      publishStatus: "DRAFT",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const result = isEdit && initialData
        ? await updateUniversityAction({ id: initialData.id, data })
        : await createUniversityAction(data);

      if (result.success) {
        toast.success(isEdit ? "University updated" : "University created");
        router.push("/admin/universities");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save university");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
      {isEdit && initialData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Profile Quality Status</h3>
            <p className="text-xs text-slate-500">Live completeness scoring across 14 profile checkpoints.</p>
          </div>
          <div className="flex items-center gap-3">
            <StaleBadge updatedAt={(initialData as any).updatedAt || new Date()} />
            <CompletenessScore score={(initialData as any).completenessScore ?? 80} size="md" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">English Name</label>
          <Input {...form.register("nameEn")} placeholder="Cairo University" className="text-xs" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Arabic Name</label>
          <Input {...form.register("nameAr")} placeholder="جامعة القاهرة" dir="rtl" className="text-xs font-arabic" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Slug (URL)</label>
          <Input {...form.register("slug")} placeholder="cairo-university" disabled={isEdit} className="text-xs font-mono" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Emoji / Icon</label>
          <Input {...form.register("emoji")} placeholder="🏛️" className="text-xs" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">University Type</label>
          <Select
            value={form.watch("type")}
            onValueChange={(val) => form.setValue("type", val as any)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">PUBLIC</SelectItem>
              <SelectItem value="PRIVATE">PRIVATE</SelectItem>
              <SelectItem value="NATIONAL">NATIONAL</SelectItem>
              <SelectItem value="INTERNATIONAL">INTERNATIONAL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Education Model</label>
          <Select
            value={form.watch("educationModel")}
            onValueChange={(val) => form.setValue("educationModel", val as any)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EGYPTIAN">EGYPTIAN</SelectItem>
              <SelectItem value="AMERICAN">AMERICAN</SelectItem>
              <SelectItem value="BRITISH">BRITISH</SelectItem>
              <SelectItem value="GERMAN">GERMAN</SelectItem>
              <SelectItem value="FRENCH">FRENCH</SelectItem>
              <SelectItem value="CANADIAN">CANADIAN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Governorate</label>
          <Input {...form.register("governorate")} placeholder="Giza" className="text-xs" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Publish Status</label>
          <Select
            value={form.watch("publishStatus")}
            onValueChange={(val) => form.setValue("publishStatus", val as any)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
              <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">English Overview</label>
          <Textarea {...form.register("overviewEn")} placeholder="Comprehensive overview of university..." rows={3} className="text-xs" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Arabic Overview</label>
          <Textarea {...form.register("overviewAr")} placeholder="نبذة تفصيلية عن الجامعة..." dir="rtl" rows={3} className="text-xs font-arabic" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="outline" type="button" onClick={() => router.push("/admin/universities")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "Saving..." : isEdit ? "Update University" : "Create University"}
        </Button>
      </div>
    </form>
  );
}
