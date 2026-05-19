import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

/** One-time demo data matching Invoice 00002 (optional). */
export const seedSampleInvoice = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(api.business.seedDefaults, {});

    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_company", (q) => q.eq("companyName", "Fernwood Fitness"))
      .first();

    const clientId =
      existingClient?._id ??
      (await ctx.db.insert("clients", {
        contactName: "Diana Williams",
        companyName: "Fernwood Fitness",
      }));

    const existingInvoice = await ctx.db
      .query("invoices")
      .withIndex("by_number", (q) => q.eq("invoiceNumber", 2))
      .first();

    if (existingInvoice) {
      return { clientId, invoiceId: existingInvoice._id };
    }

    const issuedAt = new Date("2026-05-22").getTime();
    const dueAt = new Date("2026-06-05").getTime();

    const invoiceId = await ctx.db.insert("invoices", {
      status: "final",
      clientId,
      invoiceNumber: 2,
      issuedAt,
      dueAt,
      updatedAt: issuedAt,
      includeLineItemDates: true,
      lineItems: [
        {
          description: "Revision + Kickoff meeting",
          quantity: 4,
          rateCents: 12000,
          workDate: new Date("2026-05-19T12:00:00").getTime(),
        },
        {
          description: "Development",
          quantity: 8,
          rateCents: 12000,
          workDate: new Date("2026-05-20T12:00:00").getTime(),
        },
        {
          description: "Development",
          quantity: 8,
          rateCents: 12000,
          workDate: new Date("2026-05-21T12:00:00").getTime(),
        },
        {
          description: "Development",
          quantity: 8,
          rateCents: 12000,
          workDate: new Date("2026-05-22T12:00:00").getTime(),
        },
      ],
    });

    return { clientId, invoiceId };
  },
});
