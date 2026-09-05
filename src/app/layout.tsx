import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProviders } from "@/components/providers/QueryProvider";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareDrawer } from "@/components/university/CompareDrawer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UniCompass — Egypt University Guide & Admissions Tracker",
  description:
    "Explore, filter, compare, and track admissions for all Egyptian universities (Public, Private, National, and International) with verified degree programs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${cairo.variable}`}>
      <body className="min-flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased font-sans dark:bg-slate-950 dark:text-slate-50">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CompareDrawer />
          </div>
        </AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
