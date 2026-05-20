import { Id } from "../../convex/_generated/dataModel";

type InvoiceForNumbering = {
  _id: Id<"invoices">;
  clientId?: Id<"clients">;
  status: "draft" | "final";
  invoiceNumber?: number;
};

export function nextInvoiceNumberForClient(
  invoices: InvoiceForNumbering[],
  clientId: Id<"clients">,
  excludeInvoiceId?: Id<"invoices">,
): number {
  const numbers = invoices
    .filter(
      (invoice) =>
        invoice._id !== excludeInvoiceId &&
        invoice.clientId === clientId &&
        invoice.status === "final" &&
        typeof invoice.invoiceNumber === "number",
    )
    .map((invoice) => invoice.invoiceNumber as number);

  return (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
}

export function parseInvoiceNumberInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export function sortInvoicesByLatestNumber<
  T extends { invoiceNumber?: number; status: "draft" | "final" },
>(invoices: T[]): T[] {
  return [...invoices].sort((a, b) => {
    if (a.status === "draft" && b.status !== "draft") {
      return -1;
    }
    if (a.status !== "draft" && b.status === "draft") {
      return 1;
    }

    return (b.invoiceNumber ?? 0) - (a.invoiceNumber ?? 0);
  });
}
