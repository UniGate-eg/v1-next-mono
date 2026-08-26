import { auditLogRepository } from "../../../lib/di";
import { RollbackDialog } from "../../../components/admin/universities/RollbackDialog";
import { ShieldCheck, Clock, FileText, ArrowRight, Sparkles } from "lucide-react";
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="rounded-3xl bg-[#101320] border border-[#1C2236] p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Security Trail</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            System Audit & Mutation Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Immutable log of operational mutations, publish events, and role updates with JSON state differential snapshots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl bg-[#151929] text-slate-300 text-xs font-bold border border-[#232A3E]">
            {total} Audit Snapshots
          </span>
        </div>
      </div>

      {/* Spacious Dark Audit Table */}
      <div className="bg-[#101320] rounded-3xl border border-[#1C2236] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-dark-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0C0E18] border-b border-[#1A2033] text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Actor</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Target Entity</th>
                <th className="py-4 px-6 text-right">State Differential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B2B] text-xs">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                data.map((log) => (
                  <tr key={log.id} className="hover:bg-[#14192A] transition-colors">
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </td>

                    <td className="py-4 px-6 font-bold text-white">
                      {log.actorEmail || log.actorId}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                          log.action === "ROLLBACK"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : log.action === "CREATE"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-[#181D30] text-slate-300 border border-[#252E46]"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-300">
                      <span className="font-bold text-white">{log.entityType}</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-1.5">
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
