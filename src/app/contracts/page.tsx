"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { formatContractDate } from "@/lib/contract-format";
import { formatCents } from "@/lib/format";

export default function ContractsPage() {
  const contracts = useQuery(api.contracts.list);
  const removeContract = useMutation(api.contracts.remove);
  const [deletingId, setDeletingId] = useState<Id<"contracts"> | null>(null);

  async function handleDelete(id: Id<"contracts">, label: string) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await removeContract({ id });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Create printable independent contractor agreements.
          </p>
        </div>
        <Link href="/contracts/new">
          <Button>
            <Plus className="h-4 w-4" />
            New contract
          </Button>
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-800/60 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Contract</th>
              <th className="px-4 py-3 font-medium">Agreement date</th>
              <th className="px-4 py-3 font-medium">Start date</th>
              <th className="px-4 py-3 font-medium text-right">Rate</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts?.map((contract) => {
              const label = contract.client?.companyName ?? "Draft contract";
              const editHref = `/contracts/${contract._id}/edit`;
              return (
                <tr
                  key={contract._id}
                  className="border-b border-zinc-800 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={
                        contract.status === "draft"
                          ? editHref
                          : `/contracts/${contract._id}`
                      }
                      className="inline-flex items-center gap-2 font-medium text-zinc-100 hover:underline"
                    >
                      {label}
                      {contract.status === "draft" && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                          Draft
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatContractDate(contract.agreementDate)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatContractDate(contract.startDate)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCents(contract.rateCents)}/hr
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={editHref}>
                        <Button variant="secondary" className="px-3 py-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-3 py-1.5 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                        disabled={deletingId === contract._id}
                        onClick={() => void handleDelete(contract._id, label)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === contract._id ? "…" : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {contracts?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No contracts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
