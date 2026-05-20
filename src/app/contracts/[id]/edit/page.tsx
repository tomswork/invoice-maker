"use client";

import { useQuery } from "convex/react";
import { use } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ContractForm } from "@/components/contract-form";

export default function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contract = useQuery(api.contracts.get, { id: id as Id<"contracts"> });

  if (contract === undefined) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (contract === null) {
    return <p className="text-sm text-red-400">Contract not found.</p>;
  }

  return (
    <ContractForm
      contractId={contract._id}
      initial={{
        clientId: contract.clientId,
        status: contract.status,
        agreementDate: contract.agreementDate,
        startDate: contract.startDate,
        services: contract.services,
        workingDaysPerWeek: contract.workingDaysPerWeek,
        expectedMonths: contract.expectedMonths,
        hoursPerDay: contract.hoursPerDay,
        changeNoticeDays: contract.changeNoticeDays,
        terminationNoticeDays: contract.terminationNoticeDays,
        rateCents: contract.rateCents,
        invoiceFrequency: contract.invoiceFrequency,
        paymentDueDays: contract.paymentDueDays,
        governingLawState: contract.governingLawState,
      }}
    />
  );
}
