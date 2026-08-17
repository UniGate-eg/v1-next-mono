"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useZodForm } from "../../hooks/useZodForm";
import { CreateDegreeProgramSchema, UpdateDegreeProgramSchema } from "../../schemas/program.schema";
import { createProgramAction, updateProgramAction, deleteProgramAction } from "../../app/admin/actions/program.actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";
import { DegreeProgramDTO, FacultyDTO } from "../../types/university.types";

interface ProgramModalProps {
  universityId: string;
  program?: DegreeProgramDTO;
  faculties: FacultyDTO[];
  trigger?: React.ReactNode;
}

export function ProgramModal({ universityId, program, faculties, trigger }: ProgramModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!program;

  const form = useZodForm({
    schema: isEdit ? UpdateDegreeProgramSchema : CreateDegreeProgramSchema,
    defaultValues: program ? {
      ...program,
      tuitionEgpPerYear: program.tuitionEgpPerYear ?? undefined,
      tuitionUsdPerYear: program.tuitionUsdPerYear ?? undefined,
      studyLanguage: program.studyLanguage || undefined,
      careerOpportunities: program.careerOpportunities || [],
      dualDegreePartner: program.dualDegreePartner || undefined,
      facultyId: program.facultyId || undefined,
    } : {
      universityId,
      slug: "",
      nameEn: "",
      nameAr: "",
      degreeType: "BACHELORS",
      durationYears: 4,
      studyLanguage: "ENGLISH",
      facultyId: undefined,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const result = isEdit && program
        ? await updateProgramAction(program.id, data)
        : await createProgramAction({ ...data, universityId });

      if (result.success) {
        toast.success(isEdit ? "Program updated" : "Program created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save program");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!program || !confirm("Are you sure you want to delete this program?")) return;
    setIsSubmitting(true);
    try {
      const result = await deleteProgramAction(program.id);
      if (result.success) {
        toast.success("Program deleted");
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
        {trigger || <Button variant="outline">{isEdit ? "Edit Program" : "Add Program"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Program" : "Add Program"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Faculty (Optional)</label>
            <select 
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("facultyId")}
            >
              <option value="">No Faculty</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.nameEn}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (English)</label>
              <Input {...form.register("nameEn")} placeholder="e.g. Computer Science" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (Arabic)</label>
              <Input {...form.register("nameAr")} placeholder="e.g. علوم الحاسب" dir="rtl" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input {...form.register("slug")} placeholder="e.g. cs-bachelors" disabled={isEdit} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Degree Type</label>
              <Input {...form.register("degreeType")} placeholder="e.g. Bachelor's Degree" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (Years)</label>
              <Input type="number" {...form.register("durationYears", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tuition (EGP)</label>
              <Input type="number" {...form.register("tuitionEgpPerYear", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tuition (USD)</label>
              <Input type="number" {...form.register("tuitionUsdPerYear", { valueAsNumber: true })} />
            </div>
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
