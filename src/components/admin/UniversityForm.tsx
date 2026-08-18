"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useZodForm } from "../../hooks/useZodForm";
import { CreateUniversitySchema, UpdateUniversitySchema, CreateUniversityInput, UpdateUniversityInput } from "../../schemas/university.schema";
import { createUniversityAction, updateUniversityAction } from "../../app/admin/actions/university.actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { UniversityDTO } from "../../types/university.types";

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
        ? await updateUniversityAction(initialData.id, data)
        : await createUniversityAction(data);

      if (result.success) {
        toast.success(isEdit ? "University updated" : "University created");
        router.push("/admin/universities");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save university");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name English */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Name (English)</label>
          <Input {...form.register("nameEn")} placeholder="e.g. Cairo University" />
          {form.formState.errors.nameEn && (
            <p className="text-xs text-red-500">{form.formState.errors.nameEn.message as string}</p>
          )}
        </div>

        {/* Name Arabic */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Name (Arabic)</label>
          <Input {...form.register("nameAr")} placeholder="e.g. جامعة القاهرة" dir="rtl" />
          {form.formState.errors.nameAr && (
            <p className="text-xs text-red-500">{form.formState.errors.nameAr.message as string}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <label className="text-sm font-medium">URL Slug</label>
          <Input {...form.register("slug")} placeholder="cairo-university" disabled={isEdit} />
          {form.formState.errors.slug && (
            <p className="text-xs text-red-500">{form.formState.errors.slug.message as string}</p>
          )}
        </div>

        {/* Governorate */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Governorate</label>
          <Input {...form.register("governorate")} placeholder="e.g. Cairo" />
          {form.formState.errors.governorate && (
            <p className="text-xs text-red-500">{form.formState.errors.governorate.message as string}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">University Type</label>
          <Select 
            onValueChange={(val) => form.setValue("type", val as any)} 
            defaultValue={form.getValues("type")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="PRIVATE">Private</SelectItem>
              <SelectItem value="NATIONAL">National</SelectItem>
              <SelectItem value="INTERNATIONAL">International</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Education Model */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Education Model</label>
          <Select 
            onValueChange={(val) => form.setValue("educationModel", val as any)} 
            defaultValue={form.getValues("educationModel")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EGYPTIAN">Egyptian</SelectItem>
              <SelectItem value="AMERICAN">American</SelectItem>
              <SelectItem value="BRITISH">British</SelectItem>
              <SelectItem value="GERMAN">German</SelectItem>
              <SelectItem value="FRENCH">French</SelectItem>
              <SelectItem value="CANADIAN">Canadian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (isEdit ? "Update University" : "Create University")}
        </Button>
      </div>
    </form>
  );
}
