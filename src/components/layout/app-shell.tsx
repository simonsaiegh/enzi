"use client";

import { useAuth } from "@/providers/auth-provider";
import { NamePrompt } from "@/components/auth/name-prompt";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoading, needsName } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (needsName) {
    return <NamePrompt />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
