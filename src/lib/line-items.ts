import { addDays, format, parse } from "date-fns";
import {
  dateInputValueFromTimestamp,
  formatCalendarDate,
  timestampFromDateInputValue,
  todayCalendarTimestamp,
} from "@/lib/calendar-dates";

export type LineItem = {
  description: string;
  quantity: number;
  rateCents: number;
  workDate?: number;
};

const AU_DATE_PREFIX = /^(\d{2}\/\d{2}\/\d{4})\s*-\s*(.*)$/;

export function startOfToday(): number {
  return todayCalendarTimestamp();
}

export function toDateInputValue(timestamp: number): string {
  return dateInputValueFromTimestamp(timestamp);
}

export function fromDateInputValue(value: string): number {
  return timestampFromDateInputValue(value);
}

export function formatAuLineDate(timestamp: number): string {
  return formatCalendarDate(timestamp, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function parseAuLineDate(dateStr: string): number {
  const parsed = parse(dateStr, "dd/MM/yyyy", new Date());
  return timestampFromDateInputValue(format(parsed, "yyyy-MM-dd"));
}

export function stripAuDatePrefix(description: string): string {
  const match = description.match(AU_DATE_PREFIX);
  return match ? match[2].trim() : description.trim();
}

export function inferIncludeLineItemDates(lineItems: LineItem[]): boolean {
  return lineItems.some(
    (item) =>
      item.workDate != null || AU_DATE_PREFIX.test(item.description.trim()),
  );
}

export function normalizeLineItemForForm(
  item: LineItem,
  includeDates: boolean,
): LineItem {
  if (!includeDates) {
    return { ...item, description: item.description.trim() };
  }
  if (item.workDate != null) {
    return {
      ...item,
      description: stripAuDatePrefix(item.description),
      workDate: item.workDate,
    };
  }
  const match = item.description.trim().match(AU_DATE_PREFIX);
  if (match) {
    return {
      ...item,
      description: match[2].trim(),
      workDate: parseAuLineDate(match[1]),
    };
  }
  return {
    ...item,
    description: stripAuDatePrefix(item.description),
    workDate: startOfToday(),
  };
}

export function normalizeLineItemsForForm(
  lineItems: LineItem[],
  includeLineItemDates?: boolean,
): { lineItems: LineItem[]; includeLineItemDates: boolean } {
  const includeDates =
    includeLineItemDates ?? inferIncludeLineItemDates(lineItems);
  return {
    includeLineItemDates: includeDates,
    lineItems: lineItems.map((item) =>
      normalizeLineItemForForm(item, includeDates),
    ),
  };
}

export const DEFAULT_BLOCK_HOURS = 7.5;
export const DEFAULT_BLOCK_DAYS = 4;

export function buildDayBlockLineItems(
  startDate: number,
  defaultRateCents: number,
  days: number = DEFAULT_BLOCK_DAYS,
  description = "Development",
): LineItem[] {
  const count = Math.max(1, Math.floor(days));
  return Array.from({ length: count }, (_, dayOffset) => ({
    description,
    quantity: DEFAULT_BLOCK_HOURS,
    rateCents: defaultRateCents,
    workDate: addDays(new Date(startDate), dayOffset).getTime(),
  }));
}

export function nextWorkDate(lineItems: LineItem[]): number {
  const last = lineItems[lineItems.length - 1];
  if (last?.workDate != null) {
    return addDays(new Date(last.workDate), 1).getTime();
  }
  return startOfToday();
}

export function emptyLineItem(
  defaultRateCents: number,
  includeDates: boolean,
  existingItems: LineItem[] = [],
): LineItem {
  return {
    description: "",
    quantity: 1,
    rateCents: defaultRateCents,
    ...(includeDates ? { workDate: nextWorkDate(existingItems) } : {}),
  };
}

export function normalizeLineItemsForSave(
  lineItems: LineItem[],
  includeLineItemDates: boolean,
): LineItem[] {
  return lineItems
    .filter((item) => item.description.trim())
    .map((item) => {
      const description = stripAuDatePrefix(item.description);
      if (includeLineItemDates) {
        return {
          description,
          quantity: item.quantity,
          rateCents: item.rateCents,
          workDate: item.workDate ?? startOfToday(),
        };
      }
      return {
        description,
        quantity: item.quantity,
        rateCents: item.rateCents,
      };
    });
}

export function getLineItemDescriptionParts(
  item: LineItem,
  includeLineItemDates: boolean,
): { date: string | null; description: string } {
  const description = stripAuDatePrefix(item.description);
  if (includeLineItemDates && item.workDate != null) {
    return { date: formatAuLineDate(item.workDate), description };
  }
  if (AU_DATE_PREFIX.test(item.description.trim())) {
    const match = item.description.trim().match(AU_DATE_PREFIX);
    if (match) {
      return { date: match[1], description: match[2].trim() };
    }
  }
  return { date: null, description };
}

export function formatLineItemDescription(
  item: LineItem,
  includeLineItemDates: boolean,
): string {
  const { date, description } = getLineItemDescriptionParts(
    item,
    includeLineItemDates,
  );
  if (date != null) {
    return `${date} - ${description}`;
  }
  return description;
}
