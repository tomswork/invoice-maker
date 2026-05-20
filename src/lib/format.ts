import { format } from "date-fns";

export function coerceCents(cents: number | null | undefined): number {
  if (cents == null || Number.isNaN(cents) || !Number.isFinite(cents)) {
    return 0;
  }

  return cents;
}

export function formatCents(cents: number | null | undefined): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(coerceCents(cents) / 100);
}

/** First 4 letters of the client company name (A–Z only, uppercased). */
export function clientInvoicePrefix(companyName: string): string {
  const letters = companyName.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (letters.length >= 4) {
    return letters.slice(0, 4);
  }
  return letters.padEnd(4, "X");
}

export function formatInvoiceNumber(
  num: number,
  companyName?: string,
): string {
  if (!companyName) {
    return String(num).padStart(4, "0");
  }
  const prefix = clientInvoicePrefix(companyName);
  return `${prefix}${String(num).padStart(4, "0")}`;
}

export function formatInvoiceLabel(
  invoiceNumber: number | undefined,
  status: "draft" | "final",
  companyName?: string,
): string {
  if (status === "draft" || invoiceNumber == null) {
    return "Draft";
  }
  return formatInvoiceNumber(invoiceNumber, companyName);
}

export function formatInvoiceDate(timestamp: number): string {
  return format(new Date(timestamp), "d MMM, yyyy");
}

export function formatQuantity(hours: number): string {
  const label = hours === 1 ? "Hour" : "Hours";
  return `${hours} ${label}`;
}
