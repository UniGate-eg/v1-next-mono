import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { Compass } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Student Account — UniCompass Egypt",
  description: "Create your student account to track Egyptian university applications.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              UniCompass
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create Student Account
          </h2>
          <p className="text-xs text-slate-500">
            Organize your admissions pipeline and save university applications
          </p>
        </div>

        <Suspense fallback={<div className="h-48 bg-slate-100 animate-pulse rounded-lg" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
