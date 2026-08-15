import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { LayoutDashboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admissions Dashboard — UniCompass",
  description: "Track and organize your Egyptian university applications across admission stages.",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
            <LayoutDashboard className="h-4 w-4" />
            <span>Admissions Pipeline • متابعة التقديم</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Admissions Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Organize your applications, save admission notes, and track statuses from interest to acceptance.
          </p>
        </div>

        <div>
          <Button size="sm" asChild>
            <Link href="/universities">
              <Plus className="h-4 w-4 mr-1.5" />
              Add More Universities
            </Link>
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  );
}
