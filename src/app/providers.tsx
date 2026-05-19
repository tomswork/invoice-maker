"use client";

import { AppShell } from "@/components/app-shell";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <AppShell>{children}</AppShell>
    </ConvexClientProvider>
  );
}
