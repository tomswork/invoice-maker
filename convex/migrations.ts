import { internalMutation } from "./_generated/server";

/** One-time: remove party fields moved to clients / businessSettings. */
export const stripLegacyContractPartyFields = internalMutation({
  args: {},
  handler: async (ctx) => {
    const contracts = await ctx.db.query("contracts").collect();
    let updated = 0;

    for (const contract of contracts) {
      const legacy = contract as typeof contract & {
        clientAddress?: string;
        contractorName?: string;
        contractorAbn?: string;
        contractorAddress?: string;
      };

      if (
        legacy.clientAddress === undefined &&
        legacy.contractorName === undefined &&
        legacy.contractorAbn === undefined &&
        legacy.contractorAddress === undefined
      ) {
        continue;
      }

      const {
        clientAddress: _clientAddress,
        contractorName: _contractorName,
        contractorAbn: _contractorAbn,
        contractorAddress: _contractorAddress,
        ...rest
      } = legacy;

      await ctx.db.replace(contract._id, rest);
      updated += 1;
    }

    return { updated, total: contracts.length };
  },
});
