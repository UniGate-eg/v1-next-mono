import Link from "next/link";
import { Compass, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/50 py-12 text-slate-600 dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                UniCompass Egypt
              </span>
            </div>
            <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Egypt&apos;s comprehensive university guide platform. Helping students navigate public, private, national, and international universities with verified degrees, admission stages, and comparison tools.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Explore
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/universities" className="hover:text-blue-600 transition-colors">
                  All Universities (جميع الجامعات)
                </Link>
              </li>
              <li>
                <Link href="/universities?type=NATIONAL" className="hover:text-blue-600 transition-colors">
                  National Universities (الجامعات الأهلية)
                </Link>
              </li>
              <li>
                <Link href="/universities?type=PUBLIC" className="hover:text-blue-600 transition-colors">
                  Public Universities (الجامعات الحكومية)
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-blue-600 transition-colors">
                  Compare Institutions (أداة المقارنة)
                </Link>
              </li>
            </ul>
          </div>

          {/* Student tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Student Tools
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                  Application Tracker (متابعة التقديم)
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-blue-600 transition-colors">
                  Create Student Account
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About the Project
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:border-slate-800">
          <p>© {new Date().getFullYear()} UniCompass Egypt. Open for Egyptian Students.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted with care for Egyptian Higher Education
          </p>
        </div>
      </div>
    </footer>
  );
}
