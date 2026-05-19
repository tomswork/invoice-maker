"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-100">
        <h1 className="text-xl font-semibold">Convex not configured</h1>
        <p className="text-sm text-zinc-400">
          Run{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200">npx convex dev</code> in
          this project to create{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200">.env.local</code>, then
          restart the Next.js dev server.
        </p>
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
