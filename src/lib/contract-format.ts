import { format } from "date-fns";

const NUMBER_WORDS: Record<number, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "eleven",
  12: "twelve",
  13: "thirteen",
  14: "fourteen",
};

export function formatContractDate(timestamp: number): string {
  return format(new Date(timestamp), "dd/MM/yyyy");
}

/** Australian short date for PDF filenames, e.g. 20-05-26 */
export function formatContractFilenameDate(timestamp: number): string {
  return format(new Date(timestamp), "dd-MM-yy");
}

export function slugifyForFilename(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "party";
}

export function buildContractPdfFilename(
  contractorName: string,
  clientCompanyName: string,
  agreementDate: number,
): string {
  return `${slugifyForFilename(contractorName)}-${slugifyForFilename(clientCompanyName)}-contract-${formatContractFilenameDate(agreementDate)}.pdf`;
}

export function formatNumberWord(value: number): string {
  return NUMBER_WORDS[value] ?? String(value);
}

export function formatDaysPerWeek(days: number): string {
  const label = days === 1 ? "day" : "days";
  return `${formatNumberWord(days)} ${label} per week`;
}

export function formatMonthCount(months: number): string {
  const label = months === 1 ? "month" : "months";
  return `${formatNumberWord(months)} ${label}`;
}

export function formatServiceDayHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : String(hours);
}
