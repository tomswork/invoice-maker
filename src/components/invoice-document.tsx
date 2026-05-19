import { InvoiceLogo } from "@/components/invoice-logo";
import {
  formatCents,
  formatInvoiceDate,
  formatInvoiceNumber,
  formatQuantity,
} from "@/lib/format";
import { lineItemTotalCents } from "@/lib/invoice-math";
import {
  formatLineItemDescription,
  inferIncludeLineItemDates,
  type LineItem,
} from "@/lib/line-items";

type Business = {
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

type Client = {
  contactName: string;
  companyName: string;
};

type InvoiceDocumentProps = {
  business: Business;
  client: Client;
  invoiceNumber: number;
  issuedAt: number;
  dueAt: number;
  lineItems: LineItem[];
  includeLineItemDates?: boolean;
  totalCents: number;
};

export function InvoiceDocument({
  business,
  client,
  invoiceNumber,
  issuedAt,
  dueAt,
  lineItems,
  includeLineItemDates,
  totalCents,
}: InvoiceDocumentProps) {
  const showLineDates =
    includeLineItemDates ?? inferIncludeLineItemDates(lineItems);

  const accentClass = "text-[#2a3548]";
  const totalClass = "font-bold text-[#2a3548]";

  return (
    <article className="invoice-document mx-auto max-w-[210mm] bg-white px-12 py-10 text-[15px] leading-normal text-black shadow-2xl shadow-black/50 print:max-w-none print:px-0 print:py-0 print:shadow-none">
      <header className="mb-8 flex items-start justify-between gap-8">
        <div className="flex flex-col gap-3">
          <InvoiceLogo />
          <div className="text-[15px] leading-snug">
            <p className={`font-semibold ${accentClass}`}>{business.name}</p>
            <p className={accentClass}>{business.phone}</p>
            <p className={accentClass}>{business.email}</p>
            <p className={accentClass}>ABN: {business.abn}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 text-right">
          <p className="text-[15px] font-bold tracking-[0.06em] text-black uppercase">
            Invoice
          </p>
          <div className="text-[15px] leading-snug">
            <p className="font-semibold text-black">{client.contactName}</p>
            <p className={`mt-0.5 ${accentClass}`}>{client.companyName}</p>
          </div>
          <table className="w-[17rem] border-collapse text-[15px]">
            <tbody>
              <tr className="border-b border-black/15">
                <td className="py-1 pr-6 text-left text-black/55">Number</td>
                <td className="py-1 text-right tabular-nums text-black">
                  {formatInvoiceNumber(invoiceNumber, client.companyName)}
                </td>
              </tr>
              <tr className="border-b border-black/15">
                <td className="py-1 pr-6 text-left text-black/55">Issued</td>
                <td className="py-1 text-right tabular-nums text-black">
                  {formatInvoiceDate(issuedAt)}
                </td>
              </tr>
              <tr className="border-b border-black/15">
                <td className="py-1 pr-6 text-left text-black/55">Due</td>
                <td className="py-1 text-right tabular-nums text-black">
                  {formatInvoiceDate(dueAt)}
                </td>
              </tr>
              <tr>
                <td className="py-1 pr-6 text-left text-black/55">Total</td>
                <td className="py-1 text-right font-semibold tabular-nums text-black">
                  {formatCents(totalCents)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </header>

      {/* Line items */}
      <table className="mb-10 w-full border-collapse text-[15px]">
        <thead>
          <tr className="border-b border-black/20">
            <th className="pb-2 pr-4 text-left text-[11px] font-semibold tracking-[0.12em] text-black uppercase">
              Description
            </th>
            <th className="pb-2 pr-4 text-left text-[11px] font-semibold tracking-[0.12em] text-black uppercase">
              Quantity
            </th>
            <th className="pb-2 pr-4 text-left text-[11px] font-semibold tracking-[0.12em] text-black uppercase">
              Rate
            </th>
            <th className="pb-2 text-right text-[11px] font-semibold tracking-[0.12em] text-black uppercase">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => (
            <tr key={index} className="border-b border-black/10">
              <td className="py-2.5 pr-4 align-top text-black">
                {formatLineItemDescription(item, showLineDates)}
              </td>
              <td className="py-2.5 pr-4 align-top whitespace-nowrap text-black">
                {formatQuantity(item.quantity)}
              </td>
              <td className="py-2.5 pr-4 align-top whitespace-nowrap text-black">
                {formatCents(item.rateCents)}
              </td>
              <td className="py-2.5 text-right align-top whitespace-nowrap text-black">
                {formatCents(lineItemTotalCents(item))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} />
            <td className={`pt-4 pr-4 text-right text-[15px] ${totalClass}`}>
              Total
            </td>
            <td
              className={`pt-4 text-right text-[15px] tabular-nums ${totalClass}`}
            >
              {formatCents(totalCents)}
            </td>
          </tr>
          {!business.gstRegistered && (
            <>
              <tr>
                <td colSpan={2} className="p-0" />
                <td colSpan={2} className="p-0">
                  <div className="border-b border-black/15" />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="p-0" />
                <td
                  colSpan={2}
                  className="pt-1.5 text-right text-[12px] font-normal text-black/50"
                >
                  No GST has been charged
                </td>
              </tr>
            </>
          )}
        </tfoot>
      </table>

      {/* Payment */}
      <section className="mb-10">
        <h2 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-black uppercase">
          Payment details
        </h2>
        <p className="text-[15px] leading-snug text-black">
          Please make payments via direct deposit to:
        </p>
        <p className="text-[15px] leading-snug text-black">
          Acc Name: {business.accountName}
        </p>
        <p className="text-[15px] leading-snug text-black">BSB: {business.bsb}</p>
        <p className="text-[15px] leading-snug text-black">
          Acc No: {business.accountNumber}
        </p>
        {business.payOnlineUrl && (
          <>
            <p className="mt-4">
              <a
                href={business.payOnlineUrl}
                className="text-[15px] text-black underline"
              >
                Pay invoice online
              </a>
            </p>
            <p className="mt-2 text-[15px] text-black">
              A {business.cardSurchargePercent}% surcharge applies to card
              payments
            </p>
          </>
        )}
      </section>

      <footer className="text-[15px] leading-snug text-black">
        <p>{business.thankYouLine1}</p>
        <p>{business.thankYouLine2}</p>
      </footer>
    </article>
  );
}
