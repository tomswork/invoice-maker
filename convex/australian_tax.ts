export const AU_GST_RATE = 0.1;

export type FinancialYearKey = "2025-26" | "2026-27";

export type FinancialYearTaxResult = {
  incomeTaxCents: number;
  litoCents: number;
  medicareLevyCents: number;
  totalTaxCents: number;
  netAfterTaxCents: number;
};

type IncomeTaxBracket = {
  upTo: number;
  baseTax: number;
  rate: number;
  over: number;
};

type FinancialYearTaxConfig = {
  label: string;
  startMs: number;
  endMs: number;
  brackets: IncomeTaxBracket[];
  medicareLevyRate: number;
  medicareLowerThreshold: number;
  medicareUpperThreshold: number;
  litoMaxCents: number;
  litoFirstWithdrawFrom: number;
  litoFirstWithdrawRate: number;
  litoSecondWithdrawFrom: number;
  litoSecondWithdrawRate: number;
};

/** Australian financial year starts 1 July. */
export function financialYearKeyFromTimestamp(timestamp: number): FinancialYearKey | null {
  const fyStartYear = financialYearStartYearFromTimestamp(timestamp);
  if (fyStartYear === 2025) {
    return "2025-26";
  }
  if (fyStartYear === 2026) {
    return "2026-27";
  }
  return null;
}

export function financialYearStartYearFromTimestamp(timestamp: number): number {
  const date = new Date(timestamp);
  const calendarYear = date.getFullYear();
  const month = date.getMonth();
  return month >= 6 ? calendarYear : calendarYear - 1;
}

const FINANCIAL_YEAR_CONFIG: Record<FinancialYearKey, FinancialYearTaxConfig> = {
  "2025-26": {
    label: "2025–26",
    startMs: Date.UTC(2025, 6, 1),
    endMs: Date.UTC(2026, 6, 1),
    brackets: [
      { upTo: 18_200, baseTax: 0, rate: 0, over: 0 },
      { upTo: 45_000, baseTax: 0, rate: 0.16, over: 18_200 },
      { upTo: 135_000, baseTax: 4_288, rate: 0.3, over: 45_000 },
      { upTo: 190_000, baseTax: 31_288, rate: 0.37, over: 135_000 },
      { upTo: Number.POSITIVE_INFINITY, baseTax: 51_638, rate: 0.45, over: 190_000 },
    ],
    medicareLevyRate: 0.02,
    medicareLowerThreshold: 28_011,
    medicareUpperThreshold: 35_013.75,
    litoMaxCents: 70_000,
    litoFirstWithdrawFrom: 37_500,
    litoFirstWithdrawRate: 0.05,
    litoSecondWithdrawFrom: 45_000,
    litoSecondWithdrawRate: 0.015,
  },
  "2026-27": {
    label: "2026–27",
    startMs: Date.UTC(2026, 6, 1),
    endMs: Date.UTC(2027, 6, 1),
    brackets: [
      { upTo: 18_200, baseTax: 0, rate: 0, over: 0 },
      { upTo: 45_000, baseTax: 0, rate: 0.15, over: 18_200 },
      { upTo: 135_000, baseTax: 4_020, rate: 0.3, over: 45_000 },
      { upTo: 190_000, baseTax: 31_020, rate: 0.37, over: 135_000 },
      { upTo: Number.POSITIVE_INFINITY, baseTax: 51_370, rate: 0.45, over: 190_000 },
    ],
    medicareLevyRate: 0.02,
    medicareLowerThreshold: 28_833,
    medicareUpperThreshold: 36_041.25,
    litoMaxCents: 70_000,
    litoFirstWithdrawFrom: 37_500,
    litoFirstWithdrawRate: 0.05,
    litoSecondWithdrawFrom: 45_000,
    litoSecondWithdrawRate: 0.015,
  },
};

export const DASHBOARD_FINANCIAL_YEARS: FinancialYearKey[] = ["2025-26", "2026-27"];

export function financialYearLabel(key: FinancialYearKey): string {
  return FINANCIAL_YEAR_CONFIG[key].label;
}

function grossIncomeTaxDollars(incomeDollars: number, config: FinancialYearTaxConfig): number {
  if (incomeDollars <= 0) {
    return 0;
  }

  for (const bracket of config.brackets) {
    if (incomeDollars <= bracket.upTo) {
      return bracket.baseTax + (incomeDollars - bracket.over) * bracket.rate;
    }
  }

  return 0;
}

function litoDollars(incomeDollars: number, config: FinancialYearTaxConfig): number {
  const maxOffset = config.litoMaxCents / 100;
  if (incomeDollars <= config.litoFirstWithdrawFrom) {
    return maxOffset;
  }
  if (incomeDollars <= config.litoSecondWithdrawFrom) {
    return Math.max(
      0,
      maxOffset - (incomeDollars - config.litoFirstWithdrawFrom) * config.litoFirstWithdrawRate,
    );
  }
  if (incomeDollars <= 66_667) {
    const afterFirst =
      maxOffset -
      (config.litoSecondWithdrawFrom - config.litoFirstWithdrawFrom) *
        config.litoFirstWithdrawRate;
    return Math.max(
      0,
      afterFirst - (incomeDollars - config.litoSecondWithdrawFrom) * config.litoSecondWithdrawRate,
    );
  }

  return 0;
}

function medicareLevyDollars(incomeDollars: number, config: FinancialYearTaxConfig): number {
  if (incomeDollars <= config.medicareLowerThreshold) {
    return 0;
  }
  if (incomeDollars <= config.medicareUpperThreshold) {
    return (incomeDollars - config.medicareLowerThreshold) * 0.1;
  }
  return incomeDollars * config.medicareLevyRate;
}

export function residentTaxForFinancialYearCents(
  taxableIncomeCents: number,
  financialYear: FinancialYearKey,
): FinancialYearTaxResult {
  const safeIncomeCents = Math.max(0, taxableIncomeCents || 0);
  const config = FINANCIAL_YEAR_CONFIG[financialYear];
  const incomeDollars = safeIncomeCents / 100;

  const incomeTaxCents = Math.round(grossIncomeTaxDollars(incomeDollars, config) * 100);
  const litoCents = Math.round(litoDollars(incomeDollars, config) * 100);
  const medicareLevyCents = Math.round(medicareLevyDollars(incomeDollars, config) * 100);
  const totalTaxCents = Math.max(0, incomeTaxCents - litoCents) + medicareLevyCents;

  return {
    incomeTaxCents,
    litoCents,
    medicareLevyCents,
    totalTaxCents,
    netAfterTaxCents: Math.max(0, safeIncomeCents - totalTaxCents),
  };
}

export function gstCentsFromExclusiveAmountCents(
  amountCents: number,
  gstRegistered: boolean,
): number {
  if (!gstRegistered || amountCents <= 0) {
    return 0;
  }

  return Math.round(amountCents * AU_GST_RATE);
}

export function allocateAmountProportionally(
  totalAmountCents: number,
  partAmountCents: number,
  amountToAllocateCents: number,
): number {
  if (amountToAllocateCents <= 0 || totalAmountCents <= 0 || partAmountCents <= 0) {
    return 0;
  }

  return Math.round((partAmountCents / totalAmountCents) * amountToAllocateCents);
}

export function emptyFinancialYearTaxResult(): FinancialYearTaxResult {
  return {
    incomeTaxCents: 0,
    litoCents: 0,
    medicareLevyCents: 0,
    totalTaxCents: 0,
    netAfterTaxCents: 0,
  };
}
