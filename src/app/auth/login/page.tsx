import { Suspense } from "react";
import type { Metadata } from "next";
import ModernLoginSignUp from "@/components/ui/modern-login-signup";

export const metadata: Metadata = {
  title: "Sign In — UniGate Egypt",
  description: "Access your personalized Egyptian university admissions dashboard and saved programs.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-84px)] bg-black animate-pulse" />}>
      <ModernLoginSignUp defaultMode="login" />
    </Suspense>
  );
}
