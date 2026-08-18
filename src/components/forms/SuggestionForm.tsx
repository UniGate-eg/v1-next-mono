"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSuggestionSchema, type CreateSuggestionInput } from "@/schemas/suggestion.schema";
import { submitSuggestionAction } from "@/app/actions/public/suggestion.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface SuggestionFormProps {
  universityId?: string;
  universityName?: string;
  onSuccess?: () => void;
}

export function SuggestionForm({
  universityId,
  universityName,
  onSuccess,
}: SuggestionFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSuggestionInput>({
    resolver: zodResolver(CreateSuggestionSchema),
    defaultValues: {
      universityId: universityId || "",
      suggestedField: "",
      suggestedValue: "",
      sourceUrl: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CreateSuggestionInput) => {
    setLoading(true);
    try {
      const res = await submitSuggestionAction(data);
      if (!res.success) {
        toast.error(res.error || "Failed to submit suggestion.");
      } else {
        toast.success("Thank you! Your suggestion was submitted for review.");
        reset();
        onSuccess?.();
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Field to Correct
        </label>
        <input
          type="text"
          placeholder="e.g. Faculties, Tuition, Location"
          {...register("suggestedField")}
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        />
        {errors.suggestedField && (
          <p className="mt-1 text-xs text-red-500">{errors.suggestedField.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Suggested Value
        </label>
        <textarea
          rows={3}
          placeholder="What should the correct value be?"
          {...register("suggestedValue")}
          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        />
        {errors.suggestedValue && (
          <p className="mt-1 text-xs text-red-500">{errors.suggestedValue.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Official Source URL (Optional)
        </label>
        <input
          type="url"
          placeholder="https://..."
          {...register("sourceUrl")}
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        />
        {errors.sourceUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.sourceUrl.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-9 text-xs">
        <Send className="h-3.5 w-3.5 mr-1.5" />
        {loading ? "Submitting..." : "Submit Community Feedback"}
      </Button>
    </form>
  );
}
