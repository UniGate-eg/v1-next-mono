import Link from "next/link";
import { LayoutDashboard, Building2, BookOpen, AlertCircle, ShieldCheck } from "lucide-react";

export function AdminSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/admin" className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          UniGate CMS
        </Link>
      </div>
      
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        <Link 
          href="/admin" 
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        <Link 
          href="/admin/universities" 
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Universities
        </Link>
        <Link 
          href="/admin/programs" 
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Degree Programs
        </Link>
        <Link 
          href="/admin/suggestions" 
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
          Suggestions
        </Link>
        <Link 
          href="/admin/audit-log" 
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors mt-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          Audit Logs
        </Link>
      </nav>
    </aside>
  );
}
