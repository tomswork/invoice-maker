"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ContractDocument } from "@/components/contract-document";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { buildContractDocumentProps } from "@/lib/contract-document-props";
import { fromDateInputValue, toDateInputValue } from "@/lib/line-items";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type ContractFormProps = {
  contractId: Id<"contracts">;
  initial: {
    clientId?: Id<"clients">;
    status: "draft" | "final";
    agreementDate: number;
    startDate: number;
    services: string;
    workingDaysPerWeek: number;
    expectedMonths: number;
    hoursPerDay: number;
    changeNoticeDays: number;
    terminationNoticeDays: number;
    rateCents: number;
    invoiceFrequency: string;
    paymentDueDays: number;
    governingLawState: string;
  };
};

export function ContractForm({ contractId, initial }: ContractFormProps) {
  const router = useRouter();
  const clients = useQuery(api.clients.list);
  const business = useQuery(api.business.get);
  const saveDraft = useMutation(api.contracts.saveDraft);
  const finalizeContract = useMutation(api.contracts.finalize);

  const [clientId, setClientId] = useState<Id<"clients"> | "">(
    initial.clientId ?? "",
  );
  const [agreementDate, setAgreementDate] = useState(
    toDateInputValue(initial.agreementDate),
  );
  const [startDate, setStartDate] = useState(toDateInputValue(initial.startDate));
  const [services, setServices] = useState(initial.services);
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(
    String(initial.workingDaysPerWeek),
  );
  const [expectedMonths, setExpectedMonths] = useState(
    String(initial.expectedMonths),
  );
  const [hoursPerDay, setHoursPerDay] = useState(String(initial.hoursPerDay));
  const [changeNoticeDays, setChangeNoticeDays] = useState(
    String(initial.changeNoticeDays),
  );
  const [terminationNoticeDays, setTerminationNoticeDays] = useState(
    String(initial.terminationNoticeDays),
  );
  const [rateDollars, setRateDollars] = useState(
    String(initial.rateCents / 100),
  );
  const [invoiceFrequency, setInvoiceFrequency] = useState(
    initial.invoiceFrequency,
  );
  const [paymentDueDays, setPaymentDueDays] = useState(
    String(initial.paymentDueDays),
  );
  const [governingLawState, setGoverningLawState] = useState(
    initial.governingLawState,
  );
  const [finalizing, setFinalizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const skipNextSave = useRef(true);
  const isDraft = initial.status === "draft";

  const selectedClient = useMemo(
    () => clients?.find((client) => client._id === clientId) ?? null,
    [clients, clientId],
  );

  const fields = useMemo(
    () => ({
      clientId: clientId || undefined,
      agreementDate: fromDateInputValue(agreementDate),
      startDate: fromDateInputValue(startDate),
      services,
      workingDaysPerWeek: Number(workingDaysPerWeek) || 0,
      expectedMonths: Number(expectedMonths) || 0,
      hoursPerDay: Number(hoursPerDay) || 0,
      changeNoticeDays: Number(changeNoticeDays) || 0,
      terminationNoticeDays: Number(terminationNoticeDays) || 0,
      rateCents: Math.round((Number(rateDollars) || 0) * 100),
      invoiceFrequency,
      paymentDueDays: Number(paymentDueDays) || 0,
      governingLawState,
    }),
    [
      agreementDate,
      changeNoticeDays,
      clientId,
      expectedMonths,
      governingLawState,
      hoursPerDay,
      invoiceFrequency,
      paymentDueDays,
      rateDollars,
      services,
      startDate,
      terminationNoticeDays,
      workingDaysPerWeek,
    ],
  );

  const previewProps = useMemo(() => {
    if (!selectedClient || !business) {
      return null;
    }
    return buildContractDocumentProps(fields, selectedClient, business);
  }, [business, fields, selectedClient]);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timer = setTimeout(() => {
      void (async () => {
        setSaveStatus("saving");
        try {
          await saveDraft({ id: contractId, ...fields });
          setSaveStatus("saved");
          setError(null);
        } catch (err) {
          setSaveStatus("error");
          setError(
            err instanceof Error ? err.message : "Could not save draft.",
          );
        }
      })();
    }, 500);

    return () => clearTimeout(timer);
  }, [contractId, fields, saveDraft]);

  async function onFinalize(event: FormEvent) {
    event.preventDefault();

    if (!isDraft) {
      await saveDraft({ id: contractId, ...fields });
      router.push(`/contracts/${contractId}`);
      return;
    }

    setFinalizing(true);
    setError(null);
    try {
      await finalizeContract({ id: contractId, ...fields });
      router.push(`/contracts/${contractId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finalize contract.");
    } finally {
      setFinalizing(false);
    }
  }

  if (clients === undefined || business === undefined) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  const saveStatusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Draft saved"
        : saveStatus === "error"
          ? "Save failed"
          : null;

  const clientMissingAddress =
    selectedClient && !selectedClient.address?.trim();
  const businessMissingAddress = !business?.address?.trim();

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_34rem]">
      <div className="contract-preview max-h-[calc(100vh-8rem)] overflow-auto rounded-xl bg-zinc-950 py-4">
        {previewProps ? (
          <ContractDocument {...previewProps} />
        ) : (
          <p className="px-8 text-sm text-zinc-500">
            Choose a client to preview the contract.
          </p>
        )}
      </div>

      <form onSubmit={onFinalize} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-zinc-500">
            {isDraft
              ? "Changes save automatically as a draft."
              : "Editing contract."}
          </p>
          {saveStatusLabel && (
            <span
              className={`text-xs font-medium ${
                saveStatus === "error" ? "text-red-400" : "text-zinc-500"
              }`}
            >
              {saveStatusLabel}
            </span>
          )}
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Client</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="client">Client</Label>
              <select
                id="client"
                value={clientId}
                onChange={(event) =>
                  setClientId(event.target.value as Id<"clients">)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                <option value="">Select a client…</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.contactName} — {client.companyName}
                  </option>
                ))}
              </select>
            </div>
            {selectedClient && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
                <p className="font-medium text-zinc-100">
                  {selectedClient.companyName}
                </p>
                <p className="mt-1 whitespace-pre-line text-zinc-400">
                  {selectedClient.address?.trim() || "No address on file."}
                </p>
              </div>
            )}
            {clientMissingAddress && (
              <p className="text-sm text-amber-400">
                Add an address on the{" "}
                <Link href="/clients" className="underline">
                  Clients
                </Link>{" "}
                page before finalizing.
              </p>
            )}
            {businessMissingAddress && (
              <p className="text-sm text-amber-400">
                Add your business address in{" "}
                <Link href="/settings" className="underline">
                  Settings
                </Link>{" "}
                before finalizing.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Agreement details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="agreementDate">Agreement date</Label>
              <Input
                id="agreementDate"
                type="date"
                value={agreementDate}
                onChange={(event) => setAgreementDate(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="services">Services</Label>
              <Textarea
                id="services"
                rows={3}
                value={services}
                onChange={(event) => setServices(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="workingDays">Days per week</Label>
              <Input
                id="workingDays"
                type="number"
                min={0}
                step={1}
                value={workingDaysPerWeek}
                onChange={(event) => setWorkingDaysPerWeek(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="expectedMonths">Expected months</Label>
              <Input
                id="expectedMonths"
                type="number"
                min={0}
                step={1}
                value={expectedMonths}
                onChange={(event) => setExpectedMonths(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="hoursPerDay">Hours per day</Label>
              <Input
                id="hoursPerDay"
                type="number"
                min={0}
                step={0.25}
                value={hoursPerDay}
                onChange={(event) => setHoursPerDay(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="rate">Hourly rate ($)</Label>
              <Input
                id="rate"
                type="number"
                min={0}
                step={1}
                value={rateDollars}
                onChange={(event) => setRateDollars(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="invoiceFrequency">Invoice frequency</Label>
              <Input
                id="invoiceFrequency"
                value={invoiceFrequency}
                onChange={(event) => setInvoiceFrequency(event.target.value)}
                placeholder="every week"
                required
              />
            </div>
            <div>
              <Label htmlFor="paymentDueDays">Payment due days</Label>
              <Input
                id="paymentDueDays"
                type="number"
                min={0}
                step={1}
                value={paymentDueDays}
                onChange={(event) => setPaymentDueDays(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="changeNoticeDays">Change notice days</Label>
              <Input
                id="changeNoticeDays"
                type="number"
                min={0}
                step={1}
                value={changeNoticeDays}
                onChange={(event) => setChangeNoticeDays(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="terminationNoticeDays">Termination notice days</Label>
              <Input
                id="terminationNoticeDays"
                type="number"
                min={0}
                step={1}
                value={terminationNoticeDays}
                onChange={(event) =>
                  setTerminationNoticeDays(event.target.value)
                }
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="governingLawState">Governing law state</Label>
              <Input
                id="governingLawState"
                value={governingLawState}
                onChange={(event) => setGoverningLawState(event.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={finalizing}>
            {finalizing
              ? "Finalizing…"
              : isDraft
                ? "Finalize contract"
                : "Save & view"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
