"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateSuggestionSchema,
  type CreateSuggestionInput,
  type SuggestionType,
} from "@/schemas/suggestion.schema";
import { submitSuggestionAction } from "@/server/actions/suggestion.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";

const TYPES: { value: SuggestionType; label: string }[] = [
  { value: "DATA_CORRECTION", label: "Data Correction (تصحيح بيانات)" },
  { value: "MISSING_INFO", label: "Missing Majors/Info (بيانات أو تخصصات ناقصة)" },
  { value: "NEW_UNIVERSITY", label: "New University (اقتراح جامعة جديدة)" },
  { value: "GENERAL", label: "General Feedback (ملاحظات عامة)" },
];

interface SuggestionFormProps {
  universityName?: string;
  onSuccess?: () => void;
}

export function SuggestionForm({
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
      type: "DATA_CORRECTION",
      content: universityName ? `Regarding ${universityName}: ` : "",
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
          Suggestion Category (نوع الاقتراح)
        </label>
        <select
          {...register("type")}
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Details / Description (تفاصيل الاقتراح أو التصحيح)
        </label>
        <textarea
          rows={4}
          placeholder="Please describe the updated info, missing faculty, or correction with official sources..."
          {...register("content")}
          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-9 text-xs">
        <Send className="h-3.5 w-3.5 mr-1.5" />
        {loading ? "Submitting..." : "Submit Community Feedback"}
      </Button>
    </form>
  );
}
