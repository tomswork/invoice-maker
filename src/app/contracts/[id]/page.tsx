"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ContractDocument } from "@/components/contract-document";
import { Button } from "@/components/ui/button";
import { buildContractDocumentProps } from "@/lib/contract-document-props";

export default function ContractViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const contract = useQuery(api.contracts.get, { id: id as Id<"contracts"> });

  useEffect(() => {
    if (contract?.status === "draft") {
      router.replace(`/contracts/${id}/edit`);
    }
  }, [contract?.status, id, router]);

  if (contract === undefined) {
    return (
      <p className="min-h-screen bg-zinc-950 p-8 text-sm text-zinc-500">
        Loading contract…
      </p>
    );
  }

  if (contract === null) {
    return (
      <p className="min-h-screen bg-zinc-950 p-8 text-sm text-red-400">
        Contract not found.
      </p>
    );
  }

  if (contract.status === "draft") {
    return (
      <p className="min-h-screen bg-zinc-950 p-8 text-sm text-zinc-500">
        Opening draft…
      </p>
    );
  }

  if (!contract.client || !contract.business) {
    return (
      <p className="min-h-screen bg-zinc-950 p-8 text-sm text-red-400">
        Contract is missing client or business details.
      </p>
    );
  }

  const documentProps = buildContractDocumentProps(
    contract,
    contract.client,
    contract.business,
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 print:min-h-0 print:bg-white print:text-zinc-900">
      <div className="no-print border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm text-zinc-500">Contract</p>
            <h1 className="text-xl font-semibold text-zinc-50">
              {contract.client.companyName}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/contracts/${id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <a href={`/api/contracts/${id}/pdf`}>
              <Button>Download PDF</Button>
            </a>
            <Link href="/contracts">
              <Button variant="ghost">Back</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="contract-preview bg-zinc-950 py-8 print:bg-white print:py-0">
        <ContractDocument {...documentProps} />
      </div>
    </div>
  );
}
