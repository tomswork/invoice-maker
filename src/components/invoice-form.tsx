"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { InvoiceFormPreview } from "@/components/invoice-form-preview";
import { AuDatePicker } from "@/components/ui/au-date-picker";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatCents, formatInvoiceDate, formatInvoiceNumber } from "@/lib/format";
import { invoiceTotalCents } from "@/lib/invoice-math";
import {
  dueAtFromTerms,
  termsDaysFromDates,
} from "@/lib/invoice-dates";
import {
  nextInvoiceNumberForClient,
  parseInvoiceNumberInput,
} from "@/lib/invoice-number";
import {
  buildDayBlockLineItems,
  DEFAULT_BLOCK_DAYS,
  emptyLineItem,
  fromDateInputValue,
  normalizeLineItemForForm,
  normalizeLineItemsForForm,
  normalizeLineItemsForSave,
  startOfToday,
  toDateInputValue,
  type LineItem,
} from "@/lib/line-items";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type InvoiceFormProps = {
  invoiceId: Id<"invoices">;
  initial: {
    clientId?: Id<"clients">;
    issuedAt: number;
    dueAt: number;
    invoiceNumber?: number;
    status: "draft" | "final";
    lineItems: LineItem[];
    includeLineItemDates?: boolean;
    notes?: string;
  };
};

export function InvoiceForm({ invoiceId, initial }: InvoiceFormProps) {
  const router = useRouter();
  const business = useQuery(api.business.get);
  const clients = useQuery(api.clients.list);
  const invoices = useQuery(api.invoices.list);
  const saveDraft = useMutation(api.invoices.saveDraft);
  const finalizeInvoice = useMutation(api.invoices.finalize);

  const defaultRate = business?.defaultRateCents ?? 12000;

  const initialTermsDays = useMemo(
    () => termsDaysFromDates(initial.issuedAt, initial.dueAt),
    [initial.issuedAt, initial.dueAt],
  );

  const initialLineState = useMemo(
    () =>
      normalizeLineItemsForForm(
        initial.lineItems,
        initial.includeLineItemDates,
      ),
    [initial.lineItems, initial.includeLineItemDates],
  );

  const [clientId, setClientId] = useState<Id<"clients"> | "">(
    initial.clientId ?? "",
  );
  const [issuedAt, setIssuedAt] = useState(toDateInputValue(initial.issuedAt));
  const [termsDays, setTermsDays] = useState(initialTermsDays);
  const [invoiceNumber, setInvoiceNumber] = useState(
    initial.invoiceNumber != null ? String(initial.invoiceNumber) : "",
  );
  const [includeLineItemDates, setIncludeLineItemDates] = useState(
    initialLineState.includeLineItemDates,
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialLineState.lineItems,
  );
  const [blockStartDate, setBlockStartDate] = useState(startOfToday());
  const [blockDays, setBlockDays] = useState(DEFAULT_BLOCK_DAYS);
  const [finalizing, setFinalizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const skipNextSave = useRef(true);
  const invoiceNumberManuallyEdited = useRef(initial.invoiceNumber != null);
  const isDraft = initial.status === "draft";

  const totalCents = useMemo(() => invoiceTotalCents(lineItems), [lineItems]);

  const issuedAtTimestamp = useMemo(
    () => fromDateInputValue(issuedAt),
    [issuedAt],
  );

  const dueAtTimestamp = useMemo(
    () => dueAtFromTerms(issuedAtTimestamp, termsDays),
    [issuedAtTimestamp, termsDays],
  );

  const suggestedInvoiceNumber = useMemo(() => {
    if (!clientId || !invoices?.length) {
      return 1;
    }
    return nextInvoiceNumberForClient(invoices, clientId, invoiceId);
  }, [clientId, invoices, invoiceId]);

  const parsedInvoiceNumber = useMemo(
    () => parseInvoiceNumberInput(invoiceNumber),
    [invoiceNumber],
  );

  const previewInvoiceNumber = parsedInvoiceNumber ?? suggestedInvoiceNumber;

  const selectedClient = useMemo(
    () => clients?.find((c) => c._id === clientId) ?? null,
    [clients, clientId],
  );

  useEffect(() => {
    if (!isDraft || invoiceNumberManuallyEdited.current || !clientId) {
      return;
    }
    setInvoiceNumber(String(suggestedInvoiceNumber));
  }, [isDraft, clientId, suggestedInvoiceNumber]);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timer = setTimeout(() => {
      void (async () => {
        setSaveStatus("saving");
        try {
          await saveDraft({
            id: invoiceId,
            clientId: clientId || undefined,
            issuedAt: issuedAtTimestamp,
            dueAt: dueAtTimestamp,
            lineItems,
            includeLineItemDates,
            invoiceNumber: parsedInvoiceNumber ?? undefined,
          });
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
  }, [
    invoiceId,
    clientId,
    issuedAtTimestamp,
    dueAtTimestamp,
    lineItems,
    includeLineItemDates,
    parsedInvoiceNumber,
    saveDraft,
  ]);

  function setIncludeDates(enabled: boolean) {
    setIncludeLineItemDates(enabled);
    setLineItems((items) =>
      items.map((item) => normalizeLineItemForForm(item, enabled)),
    );
  }

  function addDayBlock() {
    setIncludeLineItemDates(true);
    const block = buildDayBlockLineItems(
      blockStartDate,
      defaultRate,
      blockDays,
    );
    setLineItems((items) => {
      const hasContent = items.some((item) => item.description.trim());
      if (!hasContent) {
        return block;
      }
      return [...items, ...block];
    });
  }

  function clearAllLineItems() {
    setLineItems([]);
    setBlockStartDate(startOfToday());
  }

  async function onFinalize(event: FormEvent) {
    event.preventDefault();

    if (!isDraft) {
      router.push(`/invoices/${invoiceId}`);
      return;
    }

    if (!clientId) {
      setError("Choose a client before finalizing.");
      return;
    }
    if (!parsedInvoiceNumber) {
      setError("Enter a valid invoice number (1 or higher).");
      return;
    }
    setFinalizing(true);
    setError(null);
    try {
      const savedLineItems = normalizeLineItemsForSave(
        lineItems,
        includeLineItemDates,
      );
      if (savedLineItems.length === 0) {
        throw new Error("Add at least one line item with a description.");
      }
      await finalizeInvoice({
        id: invoiceId,
        clientId,
        issuedAt: issuedAtTimestamp,
        dueAt: dueAtTimestamp,
        lineItems: savedLineItems,
        includeLineItemDates,
        invoiceNumber: parsedInvoiceNumber,
      });
      router.push(`/invoices/${invoiceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finalize invoice.");
    } finally {
      setFinalizing(false);
    }
  }

  function updateLine(index: number, patch: Partial<LineItem>) {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  if (clients === undefined || !business) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  const lineGridClass = includeLineItemDates
    ? "grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:grid-cols-[minmax(0,150px)_1fr_100px_120px_auto]"
    : "grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:grid-cols-[1fr_100px_120px_auto]";

  const saveStatusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Draft saved"
        : saveStatus === "error"
          ? "Save failed"
          : null;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <InvoiceFormPreview
        business={business}
        client={
          selectedClient
            ? {
                contactName: selectedClient.contactName,
                companyName: selectedClient.companyName,
              }
            : null
        }
        invoiceNumber={previewInvoiceNumber}
        issuedAt={issuedAtTimestamp}
        dueAt={dueAtTimestamp}
        lineItems={lineItems}
        includeLineItemDates={includeLineItemDates}
      />

      <form onSubmit={onFinalize} className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-zinc-500">
            {isDraft ? "Changes save automatically as a draft." : "Editing invoice."}
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
          <h2 className="mb-4 text-lg font-semibold">Invoice details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="client">Client</Label>
              <select
                id="client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value as Id<"clients">)}
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
            <div>
              <Label htmlFor="issued">Issued</Label>
              <Input
                id="issued"
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms (days)</Label>
              <Input
                id="terms"
                type="number"
                min={1}
                step={1}
                value={termsDays}
                onChange={(e) =>
                  setTermsDays(Math.max(1, Number(e.target.value) || 1))
                }
                required
              />
              <p className="mt-1 text-xs text-zinc-500">
                Due {formatInvoiceDate(dueAtTimestamp)}
              </p>
            </div>
            {clientId && (
              <div>
                <Label htmlFor="invoice-number">Invoice number</Label>
                <Input
                  id="invoice-number"
                  type="number"
                  min={1}
                  step={1}
                  value={invoiceNumber}
                  onChange={(e) => {
                    invoiceNumberManuallyEdited.current = true;
                    setInvoiceNumber(e.target.value);
                  }}
                  required={!isDraft}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Displays as{" "}
                  {formatInvoiceNumber(
                    previewInvoiceNumber,
                    selectedClient?.companyName,
                  )}
                  {isDraft ? " — defaults to the next number for this client." : ""}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Line items</h2>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={includeLineItemDates}
                  onChange={(e) => setIncludeDates(e.target.checked)}
                  className="size-4 rounded border-zinc-600 bg-zinc-950 accent-zinc-100"
                />
                Include dates (dd/mm/yyyy)
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setLineItems((items) => [
                    ...items,
                    emptyLineItem(defaultRate, includeLineItemDates, items),
                  ])
                }
              >
                Add line
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={clearAllLineItems}
                disabled={lineItems.length === 0}
              >
                Clear all
              </Button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="min-w-[160px]">
              <AuDatePicker
                id="block-start"
                label="Start date"
                value={blockStartDate}
                onChange={setBlockStartDate}
              />
            </div>
            <div className="w-20">
              <Label htmlFor="block-days">Days</Label>
              <Input
                id="block-days"
                type="number"
                min={1}
                max={31}
                value={blockDays}
                onChange={(e) =>
                  setBlockDays(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </div>
            <Button type="button" variant="secondary" onClick={addDayBlock}>
              Add {blockDays} day{blockDays === 1 ? "" : "s"} (7.5h each)
            </Button>
          </div>

          <div className="space-y-4">
            {lineItems.length === 0 && (
              <p className="rounded-lg border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-zinc-500">
                No line items yet. Add a line or use the day block above.
              </p>
            )}
            {lineItems.map((item, index) => (
              <div key={index} className={lineGridClass}>
                {includeLineItemDates && (
                  <AuDatePicker
                    id={`line-date-${index}`}
                    value={item.workDate ?? startOfToday()}
                    onChange={(workDate) => updateLine(index, { workDate })}
                  />
                )}
                <div>
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateLine(index, { description: e.target.value })
                    }
                    placeholder="Development"
                  />
                </div>
                <div>
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.25}
                    value={item.quantity}
                    onChange={(e) =>
                      updateLine(index, { quantity: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Rate ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={item.rateCents / 100}
                    onChange={(e) =>
                      updateLine(index, {
                        rateCents: Math.round(Number(e.target.value) * 100),
                      })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setLineItems((items) =>
                        items.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-right text-lg font-semibold">
            Total: {formatCents(totalCents)}
          </p>
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={finalizing}>
            {finalizing
              ? "Finalizing…"
              : isDraft
                ? "Finalize invoice"
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
