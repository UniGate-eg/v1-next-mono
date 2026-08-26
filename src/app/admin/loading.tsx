import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-xs font-medium text-slate-500">Loading UniGate operations data...</p>
    </div>
  );
}
