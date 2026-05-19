import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const businessFields = {
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
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("businessSettings").first();
  },
});

export const upsert = mutation({
  args: businessFields,
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("businessSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("businessSettings", args);
  },
});

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("businessSettings").first();
    if (existing) {
      return existing._id;
    }
    return await ctx.db.insert("businessSettings", {
      name: "Tom Hubble",
      phone: "+61487395771",
      email: "tom@toms.work",
      abn: "97 205 455 086",
      accountName: "Tom Hubble",
      bsb: "923100",
      accountNumber: "67822402",
      defaultRateCents: 12000,
      gstRegistered: false,
      cardSurchargePercent: 1.75,
      thankYouLine1: "Thank you for your business.",
      thankYouLine2:
        "I'm looking forward to working with you again in the future.",
    });
  },
});
