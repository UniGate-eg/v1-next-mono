import { auditLogRepository } from "../../../lib/di";
import { format } from "date-fns";
import { ShieldCheck, Sparkles } from "lucide-react";
import { RollbackDialog } from "../../../components/admin/universities/RollbackDialog";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const { data: logs, total } = await auditLogRepository.findMany({}, 1, 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Immutable System Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete cryptographic audit log with atomic JSON snapshot reversion capabilities and actor attribution.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
          {total} Total Events
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Target Entity</th>
                <th className="px-4 py-3.5 text-right">Rollback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No audit records captured yet.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {log.actorEmail || log.actorId}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          log.action === "ROLLBACK"
                            ? "bg-red-100 text-red-700"
                            : log.action === "CREATE"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.action === "UPDATE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      <span className="font-semibold text-slate-900">{log.entityType}</span>
                      <span className="text-[11px] text-slate-400 ml-1 font-mono">({log.entityId})</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <RollbackDialog log={log} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
