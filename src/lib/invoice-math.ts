import type { LineItem } from "@/lib/line-items";

export type { LineItem };

export function lineItemTotalCents(item: LineItem): number {
  return Math.round(item.quantity * item.rateCents);
}

export function invoiceTotalCents(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + lineItemTotalCents(item), 0);
}
