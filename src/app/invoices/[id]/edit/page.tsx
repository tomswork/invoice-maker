"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { InvoiceForm } from "@/components/invoice-form";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const invoice = useQuery(api.invoices.get, { id: id as Id<"invoices"> });

  if (invoice === undefined) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (invoice === null) {
    return <p className="text-sm text-red-400">Invoice not found.</p>;
  }

  return (
    <InvoiceForm
      invoiceId={invoice._id}
      initial={{
        clientId: invoice.clientId,
        issuedAt: invoice.issuedAt,
        dueAt: invoice.dueAt,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        lineItems: invoice.lineItems,
        includeLineItemDates: invoice.includeLineItemDates,
        notes: invoice.notes,
      }}
    />
  );
}
