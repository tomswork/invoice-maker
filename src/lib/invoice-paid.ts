export function isInvoicePaid(invoice: { paidAt?: number }): boolean {
  return invoice.paidAt != null;
}
