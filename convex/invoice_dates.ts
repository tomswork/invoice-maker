export const DEFAULT_PAYMENT_TERMS_DAYS = 14;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Friday of the ISO week (Mon–Sun) containing the reference date, at local noon. */
export function fridayOfCurrentWeek(reference = new Date()): number {
  const d = new Date(reference);
  const daysSinceMonday = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysSinceMonday);
  monday.setHours(12, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return friday.getTime();
}

export function termsDaysFromDates(issuedAt: number, dueAt: number): number {
  const days = Math.round((dueAt - issuedAt) / MS_PER_DAY);
  return Math.max(1, days);
}

export function dueAtFromTerms(issuedAt: number, termsDays: number): number {
  const days = Math.max(1, Math.round(termsDays));
  return issuedAt + days * MS_PER_DAY;
}
