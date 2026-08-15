"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { type ReactNode } from "react";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";

export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    </LanguageProvider>
  );
}
