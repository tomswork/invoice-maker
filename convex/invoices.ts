import { mutation, MutationCtx, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { lineItemValidator } from "./schema";
import {
  DASHBOARD_FINANCIAL_YEARS,
  financialYearKeyFromTimestamp,
  financialYearLabel,
  gstCentsFromExclusiveAmountCents,
  residentTaxForFinancialYearCents,
  type FinancialYearKey,
} from "./australian_tax";
import {
  DEFAULT_PAYMENT_TERMS_DAYS,
  dueAtFromTerms,
  fridayOfCurrentWeek,
  termsDaysFromDates,
} from "./invoice_dates";

function lineItemTotalCents(item: {
  quantity: number;
  rateCents: number;
}): number {
  return Math.round(item.quantity * item.rateCents);
}

export function invoiceTotalCents(
  lineItems: Array<{ quantity: number; rateCents: number }>,
): number {
  const total = lineItems.reduce(
    (sum, item) => sum + lineItemTotalCents(item),
    0,
  );
  return Number.isFinite(total) ? total : 0;
}

export function invoiceStatus(
  invoice: { status?: "draft" | "final" },
): "draft" | "final" {
  return invoice.status ?? "final";
}

async function nextInvoiceNumberForClient(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  excludeInvoiceId?: Id<"invoices">,
): Promise<number> {
  const invoices = await ctx.db
    .query("invoices")
    .withIndex("by_client", (q) => q.eq("clientId", clientId))
    .collect();
  const numbers = invoices
    .filter(
      (inv) =>
        inv._id !== excludeInvoiceId &&
        invoiceStatus(inv) === "final" &&
        typeof inv.invoiceNumber === "number",
    )
    .map((inv) => inv.invoiceNumber as number);
  return (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
}

function assertValidInvoiceNumber(invoiceNumber: number) {
  if (!Number.isInteger(invoiceNumber) || invoiceNumber < 1) {
    throw new Error("Invoice number must be a positive whole number.");
  }
}

async function assertInvoiceNumberAvailable(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  invoiceNumber: number,
  excludeInvoiceId: Id<"invoices">,
) {
  const invoices = await ctx.db
    .query("invoices")
    .withIndex("by_client", (q) => q.eq("clientId", clientId))
    .collect();

  const conflict = invoices.find(
    (invoice) =>
      invoice._id !== excludeInvoiceId &&
      invoiceStatus(invoice) === "final" &&
      invoice.invoiceNumber === invoiceNumber,
  );

  if (conflict) {
    throw new Error(
      `Invoice number ${invoiceNumber} is already used for this client.`,
    );
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").order("desc").collect();
    return await Promise.all(
      invoices.map(async (invoice) => {
        const client = invoice.clientId
          ? await ctx.db.get(invoice.clientId)
          : null;
        return {
          ...invoice,
          status: invoiceStatus(invoice),
          totalCents: invoiceTotalCents(invoice.lineItems),
          client,
        };
      }),
    );
  },
});

export const clientSummary = query({
  args: {},
  handler: async (ctx) => {
    const [invoices, business] = await Promise.all([
      ctx.db.query("invoices").collect(),
      ctx.db.query("businessSettings").first(),
    ]);

    const gstRegistered = business?.gstRegistered ?? false;

    const yearTotals = Object.fromEntries(
      DASHBOARD_FINANCIAL_YEARS.map((key) => [
        key,
        { totalCents: 0, unpaidTotalCents: 0 },
      ]),
    ) as Record<
      FinancialYearKey,
      { totalCents: number; unpaidTotalCents: number }
    >;

    let totalIncomeCents = 0;
    let unpaidIncomeCents = 0;

    for (const invoice of invoices) {
      if (invoiceStatus(invoice) !== "final") {
        continue;
      }

      const invoiceTotal = invoiceTotalCents(invoice.lineItems);
      totalIncomeCents += invoiceTotal;
      if (invoice.paidAt == null) {
        unpaidIncomeCents += invoiceTotal;
      }

      const financialYear = financialYearKeyFromTimestamp(invoice.issuedAt);
      if (!financialYear) {
        continue;
      }

      yearTotals[financialYear].totalCents += invoiceTotal;
      if (invoice.paidAt == null) {
        yearTotals[financialYear].unpaidTotalCents += invoiceTotal;
      }
    }

    const financialYears = DASHBOARD_FINANCIAL_YEARS.map((key) => {
      const { totalCents } = yearTotals[key];
      const gstCents = gstCentsFromExclusiveAmountCents(
        totalCents,
        gstRegistered,
      );
      const tax = residentTaxForFinancialYearCents(totalCents, key);

      return {
        key,
        label: financialYearLabel(key),
        taxableIncomeCents: totalCents,
        gstCents,
        incomeTaxCents: tax.incomeTaxCents,
        litoCents: tax.litoCents,
        medicareLevyCents: tax.medicareLevyCents,
        totalTaxCents: tax.totalTaxCents,
      };
    });

    const taxEstimateCents = financialYears.reduce(
      (sum, year) => sum + year.totalTaxCents,
      0,
    );
    const gstPayableCents = gstCentsFromExclusiveAmountCents(
      totalIncomeCents,
      gstRegistered,
    );

    return {
      gstRegistered,
      totalIncomeCents,
      unpaidIncomeCents,
      taxEstimateCents,
      taxBreakdown: {
        financialYears,
        gstPayableCents,
      },
    };
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      return null;
    }
    const client = invoice.clientId
      ? await ctx.db.get(invoice.clientId)
      : null;
    const business = await ctx.db.query("businessSettings").first();
    return {
      ...invoice,
      status: invoiceStatus(invoice),
      totalCents: invoiceTotalCents(invoice.lineItems),
      client,
      business,
    };
  },
});

export const createDraft = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const issuedAt = fridayOfCurrentWeek();

    return await ctx.db.insert("invoices", {
      status: "draft",
      issuedAt,
      dueAt: dueAtFromTerms(issuedAt, DEFAULT_PAYMENT_TERMS_DAYS),
      lineItems: [],
      includeLineItemDates: true,
      updatedAt: now,
    });
  },
});

export const saveDraft = mutation({
  args: {
    id: v.id("invoices"),
    clientId: v.optional(v.id("clients")),
    issuedAt: v.number(),
    dueAt: v.number(),
    lineItems: v.array(lineItemValidator),
    includeLineItemDates: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    invoiceNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client) {
        throw new Error("Client not found.");
      }
    }

    if (args.invoiceNumber != null) {
      assertValidInvoiceNumber(args.invoiceNumber);
      if (args.clientId && invoiceStatus(invoice) === "final") {
        await assertInvoiceNumberAvailable(
          ctx,
          args.clientId,
          args.invoiceNumber,
          args.id,
        );
      }
    }

    const { id, ...fields } = args;
    await ctx.db.patch(id, {
      ...fields,
      clientId: args.clientId,
      updatedAt: Date.now(),
      status: invoiceStatus(invoice) === "final" ? "final" : "draft",
    });
    return id;
  },
});

export const finalize = mutation({
  args: {
    id: v.id("invoices"),
    clientId: v.id("clients"),
    issuedAt: v.number(),
    dueAt: v.number(),
    lineItems: v.array(lineItemValidator),
    includeLineItemDates: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    invoiceNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found.");
    }

    const lineItems = args.lineItems.filter((item) => item.description.trim());
    if (lineItems.length === 0) {
      throw new Error("Add at least one line item with a description.");
    }

    const invoiceNumber =
      args.invoiceNumber ??
      invoice.invoiceNumber ??
      (await nextInvoiceNumberForClient(ctx, args.clientId, args.id));
    assertValidInvoiceNumber(invoiceNumber);
    await assertInvoiceNumberAvailable(
      ctx,
      args.clientId,
      invoiceNumber,
      args.id,
    );

    await ctx.db.patch(args.id, {
      status: "final",
      clientId: args.clientId,
      invoiceNumber,
      issuedAt: args.issuedAt,
      dueAt: args.dueAt,
      lineItems,
      includeLineItemDates: args.includeLineItemDates,
      notes: args.notes,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    issuedAt: v.number(),
    dueAt: v.number(),
    lineItems: v.array(lineItemValidator),
    includeLineItemDates: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    invoiceNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found.");
    }
    if (args.lineItems.length === 0) {
      throw new Error("Add at least one line item.");
    }
    const invoiceNumber =
      args.invoiceNumber ?? (await nextInvoiceNumberForClient(ctx, args.clientId));
    return await ctx.db.insert("invoices", {
      status: "final",
      clientId: args.clientId,
      invoiceNumber,
      issuedAt: args.issuedAt,
      dueAt: args.dueAt,
      lineItems: args.lineItems,
      includeLineItemDates: args.includeLineItemDates,
      notes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("invoices"),
    clientId: v.id("clients"),
    issuedAt: v.number(),
    dueAt: v.number(),
    lineItems: v.array(lineItemValidator),
    includeLineItemDates: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    invoiceNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const invoice = await ctx.db.get(id);
    if (!invoice) {
      throw new Error("Invoice not found.");
    }
    if (fields.lineItems.length === 0) {
      throw new Error("Add at least one line item.");
    }
    if (fields.invoiceNumber != null) {
      assertValidInvoiceNumber(fields.invoiceNumber);
      await assertInvoiceNumberAvailable(
        ctx,
        fields.clientId,
        fields.invoiceNumber,
        id,
      );
    }
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const setPaid = mutation({
  args: {
    id: v.id("invoices"),
    paid: v.boolean(),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found.");
    }
    if (invoiceStatus(invoice) !== "final") {
      throw new Error("Only final invoices can be marked as paid.");
    }

    await ctx.db.patch(args.id, {
      paidAt: args.paid ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const duplicate = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    const now = Date.now();
    const issuedAt = fridayOfCurrentWeek();
    const termsDays = termsDaysFromDates(invoice.issuedAt, invoice.dueAt);

    return await ctx.db.insert("invoices", {
      status: "draft",
      clientId: invoice.clientId,
      issuedAt,
      dueAt: dueAtFromTerms(issuedAt, termsDays),
      lineItems: invoice.lineItems.map((item) => ({ ...item })),
      includeLineItemDates: invoice.includeLineItemDates,
      notes: invoice.notes,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
