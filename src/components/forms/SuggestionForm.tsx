"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSuggestionSchema, type CreateSuggestionInput } from "@/schemas/suggestion.schema";
import { submitSuggestionAction } from "@/app/actions/public/suggestion.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { language } = useLanguage();

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
        toast.error(
          res.error || (language === "ar" ? "تعذر إرسال الاقتراح." : "Failed to submit suggestion.")
        );
      } else {
        toast.success(
          language === "ar"
            ? "شكراً لك! تم إرسال اقتراحك للمراجعة."
            : "Thank you! Your suggestion was submitted for review."
        );
        reset();
        onSuccess?.();
      }
    } catch {
      toast.error(language === "ar" ? "حدث خطأ غير متوقع." : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="suggested-field" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {language === "ar" ? "الحقل المطلوب تصحيحه" : "Field to Correct"}
        </label>
        <input
          id="suggested-field"
          type="text"
          placeholder={
            language === "ar" ? "مثال: الكليات، المصروفات، الموقع" : "e.g. Faculties, Tuition, Location"
          }
          dir={language === "ar" ? "rtl" : "ltr"}
          {...register("suggestedField")}
          aria-invalid={errors.suggestedField ? "true" : "false"}
          aria-describedby={errors.suggestedField ? "suggested-field-error" : undefined}
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        />
        {errors.suggestedField && (
          <p id="suggested-field-error" role="alert" className="mt-1 text-xs text-red-500">{errors.suggestedField.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="suggested-value" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {language === "ar" ? "القيمة المقترحة" : "Suggested Value"}
        </label>
        <textarea
          id="suggested-value"
          rows={3}
          placeholder={language === "ar" ? "ما هي القيمة الصحيحة؟" : "What should the correct value be?"}
          dir={language === "ar" ? "rtl" : "ltr"}
          {...register("suggestedValue")}
          aria-invalid={errors.suggestedValue ? "true" : "false"}
          aria-describedby={errors.suggestedValue ? "suggested-value-error" : undefined}
          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        />
        {errors.suggestedValue && (
          <p id="suggested-value-error" role="alert" className="mt-1 text-xs text-red-500">{errors.suggestedValue.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="source-url" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {language === "ar" ? "رابط المصدر الرسمي (اختياري)" : "Official Source URL (Optional)"}
        </label>
        <input
          id="source-url"
          type="url"
          placeholder="https://..."
          {...register("sourceUrl")}
          aria-invalid={errors.sourceUrl ? "true" : "false"}
          aria-describedby={errors.sourceUrl ? "source-url-error" : undefined}
          className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        />
        {errors.sourceUrl && (
          <p id="source-url-error" role="alert" className="mt-1 text-xs text-red-500">{errors.sourceUrl.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-9 text-xs">
        <Send className="h-3.5 w-3.5 mr-1.5" />
        {loading
          ? language === "ar"
            ? "جارٍ الإرسال..."
            : "Submitting..."
          : language === "ar"
            ? "إرسال الملاحظة"
            : "Submit Community Feedback"}
      </Button>
    </form>
  );
}
