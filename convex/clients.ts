import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    contactName: v.string(),
    companyName: v.string(),
    abn: v.optional(v.string()),
    address: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clients", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    contactName: v.string(),
    companyName: v.string(),
    abn: v.optional(v.string()),
    address: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .collect();
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .collect();
    if (invoices.length > 0) {
      throw new Error("Cannot delete a client with existing invoices.");
    }
    if (contracts.length > 0) {
      throw new Error("Cannot delete a client with existing contracts.");
    }
    await ctx.db.delete(args.id);
  },
});
