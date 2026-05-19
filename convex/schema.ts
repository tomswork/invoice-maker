import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const lineItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  rateCents: v.number(),
  workDate: v.optional(v.number()),
});

export const invoiceStatusValidator = v.union(
  v.literal("draft"),
  v.literal("final"),
);

export default defineSchema({
  businessSettings: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    abn: v.string(),
    accountName: v.string(),
    bsb: v.string(),
    accountNumber: v.string(),
    defaultRateCents: v.number(),
    gstRegistered: v.boolean(),
    cardSurchargePercent: v.number(),
    payOnlineUrl: v.optional(v.string()),
    thankYouLine1: v.string(),
    thankYouLine2: v.string(),
  }),

  clients: defineTable({
    contactName: v.string(),
    companyName: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_company", ["companyName"]),

  invoices: defineTable({
    status: v.optional(invoiceStatusValidator),
    clientId: v.optional(v.id("clients")),
    invoiceNumber: v.optional(v.number()),
    issuedAt: v.number(),
    dueAt: v.number(),
    lineItems: v.array(lineItemValidator),
    includeLineItemDates: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_number", ["invoiceNumber"])
    .index("by_status", ["status"]),
});
