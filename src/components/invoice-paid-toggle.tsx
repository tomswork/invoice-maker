"use client";

import { useMutation } from "convex/react";
import { Check, CircleDollarSign } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { isInvoicePaid } from "@/lib/invoice-paid";

type InvoicePaidToggleProps = {
  id: Id<"invoices">;
  paidAt?: number;
  disabled?: boolean;
  compact?: boolean;
};

export function InvoicePaidBadge({ paidAt }: { paidAt?: number }) {
  if (!isInvoicePaid({ paidAt })) {
    return null;
  }

  return (
    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
      Paid
    </span>
  );
}

export function InvoicePaidToggle({
  id,
  paidAt,
  disabled = false,
  compact = false,
}: InvoicePaidToggleProps) {
  const setPaid = useMutation(api.invoices.setPaid);
  const [loading, setLoading] = useState(false);
  const paid = isInvoicePaid({ paidAt });

  async function handleToggle() {
    setLoading(true);
    try {
      await setPaid({ id, paid: !paid });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={paid ? "secondary" : "ghost"}
      className={
        compact
          ? "px-3 py-1.5"
          : paid
            ? "text-emerald-400"
            : "text-zinc-300"
      }
      disabled={disabled || loading}
      onClick={() => void handleToggle()}
    >
      {paid ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {loading ? "…" : compact ? "Paid" : "Mark unpaid"}
        </>
      ) : (
        <>
          <CircleDollarSign className="h-3.5 w-3.5" />
          {loading ? "…" : compact ? "Mark paid" : "Mark as paid"}
        </>
      )}
    </Button>
  );
}
