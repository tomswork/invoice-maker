"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";

export default function NewInvoicePage() {
  const router = useRouter();
  const createDraft = useMutation(api.invoices.createDraft);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void createDraft({})
      .then((id) => {
        router.replace(`/invoices/${id}/edit`);
      })
      .catch(() => {
        started.current = false;
      });
  }, [createDraft, router]);

  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-sm text-zinc-500">Creating draft…</p>
    </div>
  );
}
