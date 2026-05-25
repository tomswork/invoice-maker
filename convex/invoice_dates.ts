import { MS_PER_DAY } from "./calendar_dates";

export { fridayOfCurrentWeek } from "./calendar_dates";

export const DEFAULT_PAYMENT_TERMS_DAYS = 14;

export function termsDaysFromDates(issuedAt: number, dueAt: number): number {
  const days = Math.round((dueAt - issuedAt) / MS_PER_DAY);
  return Math.max(1, days);
}

export function dueAtFromTerms(issuedAt: number, termsDays: number): number {
  const days = Math.max(1, Math.round(termsDays));
  return issuedAt + days * MS_PER_DAY;
}
