export {
  AU_GST_RATE,
  DASHBOARD_FINANCIAL_YEARS,
  allocateAmountProportionally,
  financialYearKeyFromTimestamp,
  financialYearLabel,
  financialYearStartYearFromTimestamp,
  gstCentsFromExclusiveAmountCents,
  residentTaxForFinancialYearCents,
  type FinancialYearKey,
  type FinancialYearTaxResult,
} from "../../convex/australian_tax";

import { gstCentsFromExclusiveAmountCents } from "../../convex/australian_tax";

export function totalIncGstCents(
  amountCents: number,
  gstRegistered: boolean,
): number {
  return amountCents + gstCentsFromExclusiveAmountCents(amountCents, gstRegistered);
}
