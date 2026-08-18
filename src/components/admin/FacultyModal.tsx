"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useZodForm } from "../../hooks/useZodForm";
import { CreateFacultySchema, UpdateFacultySchema } from "../../schemas/faculty.schema";
import { createFacultyAction, updateFacultyAction, deleteFacultyAction } from "../../app/admin/actions/faculty.actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";
import { FacultyDTO } from "../../types/university.types";

interface FacultyModalProps {
  universityId: string;
  faculty?: FacultyDTO;
  trigger?: React.ReactNode;
}

export function FacultyModal({ universityId, faculty, trigger }: FacultyModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!faculty;

  const form = useZodForm({
    schema: isEdit ? UpdateFacultySchema : CreateFacultySchema,
    defaultValues: faculty ? {
      ...faculty,
      deanName: faculty.deanName || "",
      descriptionEn: faculty.descriptionEn || "",
      descriptionAr: faculty.descriptionAr || "",
      departments: faculty.departments || []
    } : {
      universityId,
      nameEn: "",
      nameAr: "",
      deanName: "",
      departments: [],
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const result = isEdit && faculty
        ? await updateFacultyAction(faculty.id, data)
        : await createFacultyAction({ ...data, universityId });

      if (result.success) {
        toast.success(isEdit ? "Faculty updated" : "Faculty created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save faculty");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!faculty || !confirm("Are you sure you want to delete this faculty?")) return;
    setIsSubmitting(true);
    try {
      const result = await deleteFacultyAction(faculty.id);
      if (result.success) {
        toast.success("Faculty deleted");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">{isEdit ? "Edit Faculty" : "Add Faculty"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Faculty" : "Add Faculty"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name (English)</label>
            <Input {...form.register("nameEn")} placeholder="e.g. Faculty of Engineering" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Name (Arabic)</label>
            <Input {...form.register("nameAr")} placeholder="e.g. كلية الهندسة" dir="rtl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dean Name (Optional)</label>
            <Input {...form.register("deanName")} placeholder="e.g. Dr. Ahmed Hassan" />
          </div>
          
          <div className="flex justify-between pt-4">
            {isEdit && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
