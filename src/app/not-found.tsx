import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
        404 — Page Not Found
      </h1>
      <p className="max-w-md text-sm text-slate-500">
        The university or page you are looking for does not exist or has been moved.
      </p>
      <Button asChild className="mt-2">
        <Link href="/universities" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Browse Universities Directory</span>
        </Link>
      </Button>
    </div>
  );
}
