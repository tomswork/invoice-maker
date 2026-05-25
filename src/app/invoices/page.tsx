"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  InvoicePaidBadge,
  InvoicePaidToggle,
} from "@/components/invoice-paid-toggle";
import { Button } from "@/components/ui/button";
import {
  formatCents,
  formatInvoiceDate,
  formatInvoiceLabel,
} from "@/lib/format";
import { sortInvoicesByLatestNumber } from "@/lib/invoice-number";
import { fridayOfCurrentWeek } from "@/lib/invoice-dates";

export default function InvoicesPage() {
  const router = useRouter();
  const invoices = useQuery(api.invoices.list);
  const removeInvoice = useMutation(api.invoices.remove);
  const duplicateInvoice = useMutation(api.invoices.duplicate);
  const [deletingId, setDeletingId] = useState<Id<"invoices"> | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<Id<"invoices"> | null>(
    null,
  );

  const sortedInvoices = useMemo(
    () => (invoices ? sortInvoicesByLatestNumber(invoices) : undefined),
    [invoices],
  );

  async function handleDuplicate(id: Id<"invoices">) {
    setDuplicatingId(id);
    try {
      const newId = await duplicateInvoice({
        id,
        issuedAt: fridayOfCurrentWeek(),
      });
      router.push(`/invoices/${newId}/edit`);
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleDelete(id: Id<"invoices">, label: string) {
    if (
      !window.confirm(
        `Delete ${label}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await removeInvoice({ id });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-zinc-400">
            All invoices you have created.
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="h-4 w-4" />
            New invoice
          </Button>
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-800/60 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedInvoices?.map((invoice) => {
              const label = formatInvoiceLabel(
                invoice.invoiceNumber,
                invoice.status,
                invoice.client?.companyName,
              );
              const editHref = `/invoices/${invoice._id}/edit`;

              return (
                <tr
                  key={invoice._id}
                  className="border-b border-zinc-800 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={
                        invoice.status === "draft"
                          ? editHref
                          : `/invoices/${invoice._id}`
                      }
                      className="inline-flex items-center gap-2 font-medium text-zinc-100 hover:underline"
                    >
                      {label}
                      {invoice.status === "draft" && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                          Draft
                        </span>
                      )}
                      <InvoicePaidBadge paidAt={invoice.paidAt} />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {invoice.client?.companyName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatInvoiceDate(invoice.issuedAt)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatInvoiceDate(invoice.dueAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCents(invoice.totalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {invoice.status === "final" && (
                        <InvoicePaidToggle
                          id={invoice._id}
                          paidAt={invoice.paidAt}
                          compact
                        />
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3 py-1.5"
                        disabled={duplicatingId === invoice._id}
                        onClick={() => void handleDuplicate(invoice._id)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {duplicatingId === invoice._id ? "…" : "Duplicate"}
                      </Button>
                      <Link href={editHref}>
                        <Button variant="secondary" className="px-3 py-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-3 py-1.5 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                        disabled={deletingId === invoice._id}
                        aria-label={`Delete ${label}`}
                        onClick={() => void handleDelete(invoice._id, label)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedInvoices?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
