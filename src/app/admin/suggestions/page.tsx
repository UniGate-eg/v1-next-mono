import { SuggestionReviewDialog } from "@/components/admin/SuggestionReviewDialog";
import { suggestionRepository } from "@/lib/di";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminSuggestionsPage() {
  const { data: suggestions, total } = await suggestionRepository.findPending(1, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Suggestion Inbox</h1>
        <Badge variant="secondary">
          {total} Pending
        </Badge>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">University</th>
                <th className="px-6 py-3">Field</th>
                <th className="px-6 py-3">Proposed Value</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((suggestion: any) => (
                <tr key={suggestion.id} className="border-b dark:border-slate-800">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {format(new Date(suggestion.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {suggestion.university?.nameEn || suggestion.universityId}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{suggestion.suggestedField}</Badge>
                  </td>
                  <td className="px-6 py-4 max-w-[300px] truncate">
                    {suggestion.suggestedValue}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <SuggestionReviewDialog suggestion={suggestion} />
                  </td>
                </tr>
              ))}
              {suggestions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No pending suggestions!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
