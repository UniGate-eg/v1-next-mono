import { Suspense } from "react";
import type { Metadata } from "next";
import ModernLoginSignUp from "@/components/ui/modern-login-signup";

export const metadata: Metadata = {
  title: "Create Account — UniGate Egypt",
  description: "Create your free student admission tracking account on UniGate Egypt.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-84px)] bg-black animate-pulse" />}>
      <ModernLoginSignUp defaultMode="signup" />
    </Suspense>
  );
}
