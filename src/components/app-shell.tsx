"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Settings, Users } from "lucide-react";
import { ReactNode } from "react";

const nav = [
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrintView =
    /^\/invoices\/[^/]+$/.test(pathname) &&
    pathname !== "/invoices/new" &&
    !pathname.endsWith("/edit");
  const isComposeView =
    pathname === "/invoices/new" || pathname.endsWith("/edit");

  if (isPrintView) {
    return <>{children}</>;
  }

  const widthClass = isComposeView ? "max-w-[90rem]" : "max-w-6xl";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div
          className={`mx-auto flex items-center justify-between gap-6 px-4 py-4 sm:px-6 ${widthClass}`}
        >
          <Link
            href="/invoices"
            className="text-lg font-semibold tracking-tight text-zinc-50"
          >
            Invoice Maker
          </Link>
          <nav className="flex flex-wrap gap-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className={`mx-auto px-4 py-8 sm:px-6 ${widthClass}`}>{children}</main>
    </div>
  );
}
