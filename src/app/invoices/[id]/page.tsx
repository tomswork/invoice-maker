"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { InvoiceDocument } from "@/components/invoice-document";
import { Button } from "@/components/ui/button";
import { formatInvoiceNumber } from "@/lib/format";
import { inferIncludeLineItemDates } from "@/lib/line-items";

export default function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const invoice = useQuery(api.invoices.get, { id: id as Id<"invoices"> });

  useEffect(() => {
    if (invoice?.status === "draft") {
      router.replace(`/invoices/${id}/edit`);
    }
  }, [invoice?.status, id, router]);

  if (invoice === undefined) {
    return (
      <p className="min-h-screen bg-zinc-950 p-8 text-sm text-zinc-500">
        Loading invoice…
      </p>
    );
  }

  if (invoice === null) {
    return (
      <p className="min-h-screen bg-zinc-950 p-8 text-sm text-red-400">
        Invoice not found.
      </p>
    );
  }

  if (invoice.status === "draft") {
    return (
      <p className="min-h-screen bg-zinc-950 p-8 text-sm text-zinc-500">
        Opening draft…
      </p>
    );
  }

  if (!invoice.client || !invoice.business) {
    return (
      <p className="min-h-screen bg-zinc-950 p-8 text-sm text-red-400">
        Invoice is missing client or business details.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 print:min-h-0 print:bg-white print:text-zinc-900">
      <div className="no-print border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm text-zinc-500">Invoice</p>
            <h1 className="text-xl font-semibold text-zinc-50">
              {formatInvoiceNumber(
                invoice.invoiceNumber!,
                invoice.client.companyName,
              )}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/invoices/${id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button onClick={() => window.print()}>Print / PDF</Button>
            <Link href="/invoices">
              <Button variant="ghost">Back</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="invoice-preview bg-zinc-950 py-8 print:bg-white print:py-0">
        <InvoiceDocument
          business={invoice.business}
          client={invoice.client}
          invoiceNumber={invoice.invoiceNumber!}
          issuedAt={invoice.issuedAt}
          dueAt={invoice.dueAt}
          lineItems={invoice.lineItems}
          includeLineItemDates={
            invoice.includeLineItemDates ??
            inferIncludeLineItemDates(invoice.lineItems)
          }
          totalCents={invoice.totalCents}
        />
      </div>
    </div>
  );
}
