"use client";

import { InvoiceDocument } from "@/components/invoice-document";
import { invoiceTotalCents } from "@/lib/invoice-math";
import { normalizeLineItemsForSave, type LineItem } from "@/lib/line-items";

type BusinessSettings = {
  name: string;
  phone: string;
  email: string;
  abn: string;
  accountName: string;
  bsb: string;
  accountNumber: string;
  gstRegistered: boolean;
  cardSurchargePercent: number;
  payOnlineUrl?: string;
  thankYouLine1: string;
  thankYouLine2: string;
};

type InvoiceFormPreviewProps = {
  business: BusinessSettings;
  client: { contactName: string; companyName: string } | null;
  invoiceNumber: number;
  issuedAt: number;
  dueAt: number;
  lineItems: LineItem[];
  includeLineItemDates: boolean;
};

export function InvoiceFormPreview({
  business,
  client,
  invoiceNumber,
  issuedAt,
  dueAt,
  lineItems,
  includeLineItemDates,
}: InvoiceFormPreviewProps) {
  const displayItems = normalizeLineItemsForSave(lineItems, includeLineItemDates);
  const itemsForTotal = displayItems.length > 0 ? displayItems : lineItems;
  const totalCents = invoiceTotalCents(itemsForTotal);

  return (
    <div className="sticky top-8">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Preview
      </p>
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-2">
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg">
          <InvoiceDocument
            business={business}
            client={
              client ?? {
                contactName: "Contact name",
                companyName: "Company name",
              }
            }
            invoiceNumber={invoiceNumber}
            issuedAt={issuedAt}
            dueAt={dueAt}
            lineItems={itemsForTotal}
            includeLineItemDates={includeLineItemDates}
            totalCents={totalCents}
          />
        </div>
      </div>
    </div>
  );
}
