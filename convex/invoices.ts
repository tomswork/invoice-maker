import { mutation, MutationCtx, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { lineItemValidator } from "./schema";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function lineItemTotalCents(item: {
  quantity: number;
  rateCents: number;
}): number {
  return Math.round(item.quantity * item.rateCents);
}

export function invoiceTotalCents(
  lineItems: Array<{ quantity: number; rateCents: number }>,
): number {
  return lineItems.reduce((sum, item) => sum + lineItemTotalCents(item), 0);
}

export function invoiceStatus(
  invoice: { status?: "draft" | "final" },
): "draft" | "final" {
  return invoice.status ?? "final";
}

async function nextInvoiceNumberForClient(
  ctx: MutationCtx,
  clientId: Id<"clients">,
): Promise<number> {
  const invoices = await ctx.db
    .query("invoices")
    .withIndex("by_client", (q) => q.eq("clientId", clientId))
    .collect();
  const numbers = invoices
    .filter(
      (inv) =>
        invoiceStatus(inv) === "final" && typeof inv.invoiceNumber === "number",
    )
    .map((inv) => inv.invoiceNumber as number);
  return (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
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

    return await ctx.db.insert("invoices", {
      status: "draft",
      issuedAt: now,
      dueAt: now + 14 * MS_PER_DAY,
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
      invoice.invoiceNumber ?? (await nextInvoiceNumberForClient(ctx, args.clientId));

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
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
