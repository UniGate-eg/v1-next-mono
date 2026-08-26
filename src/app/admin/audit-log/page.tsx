import { auditLogRepository } from "../../../lib/di";
import { RollbackDialog } from "../../../components/admin/universities/RollbackDialog";
import { ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Security Audit Log | UniGate Admin",
};

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const { data, total } = await auditLogRepository.findMany(undefined, page, 50);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security & Governance Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mt-1">
            System Audit & Mutation Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Immutable log of operational mutations, publish events, and role updates with JSON state differential snapshots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-700">
            {total} Audit Snapshots
          </span>
        </div>
      </div>

      {/* Clean Audit Table Box */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Actor</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Target Entity</th>
                <th className="py-3.5 px-6 text-right">State Differential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                data.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </td>

                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                      {log.actorEmail || log.actorId}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${
                          log.action === "ROLLBACK"
                            ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                            : log.action === "CREATE"
                            ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                            : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{log.entityType}</span>
                      <span className="text-[10px] text-gray-400 font-mono ml-1.5">
                        ({log.entityId.slice(0, 8)}...)
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {log.beforeState && (
                        <RollbackDialog log={log as any} />
                      )}
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
