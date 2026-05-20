import { mutation, MutationCtx, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const DAY_MS = 24 * 60 * 60 * 1000;

const contractFields = {
  clientId: v.optional(v.id("clients")),
  agreementDate: v.number(),
  startDate: v.number(),
  services: v.string(),
  workingDaysPerWeek: v.number(),
  expectedMonths: v.number(),
  hoursPerDay: v.number(),
  changeNoticeDays: v.number(),
  terminationNoticeDays: v.number(),
  rateCents: v.number(),
  invoiceFrequency: v.string(),
  paymentDueDays: v.number(),
  governingLawState: v.string(),
};

type ContractFields = {
  clientId?: Id<"clients">;
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

function contractStatus(contract: {
  status?: "draft" | "final";
}): "draft" | "final" {
  return contract.status ?? "final";
}

async function assertClientExists(
  ctx: Pick<MutationCtx, "db">,
  clientId?: Id<"clients">,
) {
  if (!clientId) {
    return;
  }
  const client = await ctx.db.get(clientId);
  if (!client) {
    throw new Error("Client not found.");
  }
}

function cleanFields(args: ContractFields): ContractFields {
  return {
    ...args,
    services: args.services.trim(),
    invoiceFrequency: args.invoiceFrequency.trim(),
    governingLawState: args.governingLawState.trim(),
  };
}

async function validateFinalContract(
  ctx: Pick<MutationCtx, "db">,
  fields: ReturnType<typeof cleanFields>,
) {
  if (!fields.clientId) {
    throw new Error("Choose a client before finalizing.");
  }

  const client = await ctx.db.get(fields.clientId);
  if (!client) {
    throw new Error("Client not found.");
  }
  if (!client.address?.trim()) {
    throw new Error("Add an address on the client before finalizing.");
  }

  const business = await ctx.db.query("businessSettings").first();
  if (!business) {
    throw new Error("Add your business settings before finalizing.");
  }
  if (!business.name.trim()) {
    throw new Error("Add your contractor name in settings.");
  }
  if (!business.address?.trim()) {
    throw new Error("Add your business address in settings.");
  }

  if (!fields.services) {
    throw new Error("Add the services provided.");
  }
  if (fields.rateCents <= 0) {
    throw new Error("Add an hourly rate greater than zero.");
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const contracts = await ctx.db.query("contracts").order("desc").collect();
    return await Promise.all(
      contracts.map(async (contract) => {
        const client = contract.clientId
          ? await ctx.db.get(contract.clientId)
          : null;
        return {
          ...contract,
          status: contractStatus(contract),
          client,
        };
      }),
    );
  },
});

export const get = query({
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.id);
    if (!contract) {
      return null;
    }
    const client = contract.clientId ? await ctx.db.get(contract.clientId) : null;
    const business = await ctx.db.query("businessSettings").first();
    return {
      ...contract,
      status: contractStatus(contract),
      client,
      business,
    };
  },
});

export const createDraft = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const business = await ctx.db.query("businessSettings").first();

    return await ctx.db.insert("contracts", {
      status: "draft",
      agreementDate: now + DAY_MS,
      startDate: now + DAY_MS,
      services: "Software Development.",
      workingDaysPerWeek: 4,
      expectedMonths: 4,
      hoursPerDay: 7.5,
      changeNoticeDays: 7,
      terminationNoticeDays: 14,
      rateCents: business?.defaultRateCents ?? 12000,
      invoiceFrequency: "every week",
      paymentDueDays: 14,
      governingLawState: "Victoria",
      updatedAt: now,
    });
  },
});

export const saveDraft = mutation({
  args: {
    id: v.id("contracts"),
    ...contractFields,
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.id);
    if (!contract) {
      throw new Error("Contract not found.");
    }

    await assertClientExists(ctx, args.clientId);

    const { id, ...fields } = args;
    await ctx.db.patch(id, {
      ...cleanFields(fields),
      status: contractStatus(contract) === "final" ? "final" : "draft",
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const finalize = mutation({
  args: {
    id: v.id("contracts"),
    ...contractFields,
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.id);
    if (!contract) {
      throw new Error("Contract not found.");
    }

    await assertClientExists(ctx, args.clientId);

    const { id, ...rawFields } = args;
    const fields = cleanFields(rawFields);
    await validateFinalContract(ctx, fields);

    await ctx.db.patch(id, {
      ...fields,
      status: "final",
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
