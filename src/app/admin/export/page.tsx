import { ExportButton } from "./ExportButton";
import { Database, FileJson, Clock } from "lucide-react";

export default function AdminExportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Database Export</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold">Full Database Snapshot</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Export a complete JSON snapshot of all published and draft universities, including faculties, programs, and tuitions. This is useful for backups, offline analysis, or data migrations.
          </p>
          <ExportButton />
        </div>

        <div className="rounded-xl border bg-slate-50 p-6 dark:bg-slate-900">
          <h3 className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">Export Information</h3>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <FileJson className="w-4 h-4 mt-0.5 text-slate-400" />
              <span>Format: Standard JSON (schema v2.0)</span>
            </li>
            <li className="flex gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-slate-400" />
              <span>Generation Time: ~2-5 seconds</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
