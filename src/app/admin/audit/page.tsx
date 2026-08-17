import { auditLogRepository } from "@/lib/di";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { RollbackButton } from "./RollbackButton";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const { data: logs, total } = await auditLogRepository.findMany({}, 1, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <Badge variant="secondary">
          {total} Records
        </Badge>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Entity</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="border-b dark:border-slate-800">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {log.actorEmail || log.actorId}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{log.action}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="px-6 py-4">
                    <RollbackButton logId={log.id} />
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No audit logs recorded yet.
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
