"use client";

import { useQuery } from "convex/react";
import { Info } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { formatCents } from "@/lib/format";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-50">
        {value}
      </p>
      {hint && <p className="mt-2 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const summary = useQuery(api.invoices.clientSummary);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Finalized invoice totals. Tax is an estimate on ex-GST income by
          financial year.
        </p>
      </div>

      {summary === undefined ? (
        <p className="text-sm text-zinc-500">Loading dashboard…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total income"
            value={formatCents(summary.totalIncomeCents)}
            hint={
              summary.gstRegistered
                ? "Ex GST · finalized invoices"
                : "Finalized invoices"
            }
          />
          <StatCard
            label="Unpaid income"
            value={formatCents(summary.unpaidIncomeCents)}
            hint="Outstanding on finalized invoices"
          />
          <div className="group relative">
            <StatCard
              label="Tax estimate"
              value={formatCents(summary.taxEstimateCents)}
              hint="Hover for breakdown"
            />
            <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-72 rounded-lg border border-zinc-700 bg-zinc-900 p-4 opacity-0 shadow-xl transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Info className="h-4 w-4 text-zinc-500" />
                Tax breakdown
              </div>
              <div className="space-y-4 text-sm">
                {summary.taxBreakdown.financialYears.map((year) => (
                  <div key={year.key}>
                    <p className="font-medium text-zinc-300">{year.label}</p>
                    {year.taxableIncomeCents > 0 ? (
                      <dl className="mt-1.5 space-y-1 text-zinc-400">
                        <div className="flex justify-between gap-4">
                          <dt>Taxable income</dt>
                          <dd className="tabular-nums text-zinc-300">
                            {formatCents(year.taxableIncomeCents)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt>Income tax</dt>
                          <dd className="tabular-nums text-zinc-300">
                            {formatCents(year.incomeTaxCents)}
                          </dd>
                        </div>
                        {year.litoCents > 0 && (
                          <div className="flex justify-between gap-4">
                            <dt>LITO offset</dt>
                            <dd className="tabular-nums text-indigo-300">
                              −{formatCents(year.litoCents)}
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-4">
                          <dt>Medicare levy</dt>
                          <dd className="tabular-nums text-zinc-300">
                            {formatCents(year.medicareLevyCents)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-zinc-800 pt-1 font-medium">
                          <dt className="text-zinc-300">Year total</dt>
                          <dd className="tabular-nums text-zinc-100">
                            {formatCents(year.totalTaxCents)}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-1 text-zinc-500">No invoices this year</p>
                    )}
                  </div>
                ))}
                {summary.gstRegistered && summary.taxBreakdown.gstPayableCents > 0 && (
                  <div className="border-t border-zinc-800 pt-3">
                    <div className="flex justify-between gap-4 text-zinc-400">
                      <span>GST payable</span>
                      <span className="tabular-nums text-zinc-300">
                        {formatCents(summary.taxBreakdown.gstPayableCents)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Separate from income tax · not included in estimate
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
