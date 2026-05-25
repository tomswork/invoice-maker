export const CALENDAR_TIME_ZONE = "Australia/Sydney";
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

type CalendarParts = { year: number; month: number; day: number };

export function calendarDateParts(
  timestamp: number,
  timeZone = CALENDAR_TIME_ZONE,
): CalendarParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)!.value);

  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Store calendar dates at UTC noon so they stay stable across time zones. */
export function timestampFromCalendarParts(
  year: number,
  month: number,
  day: number,
): number {
  return Date.UTC(year, month - 1, day, 12, 0, 0, 0);
}

export function timestampFromDateInputValue(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return timestampFromCalendarParts(year, month, day);
}

export function dateInputValueFromTimestamp(
  timestamp: number,
  timeZone = CALENDAR_TIME_ZONE,
): string {
  const { year, month, day } = calendarDateParts(timestamp, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatCalendarDate(
  timestamp: number,
  options: Intl.DateTimeFormatOptions,
  timeZone = CALENDAR_TIME_ZONE,
): string {
  return new Intl.DateTimeFormat("en-AU", {
    ...options,
    timeZone,
  }).format(timestamp);
}

export function todayCalendarTimestamp(
  reference = new Date(),
  timeZone = CALENDAR_TIME_ZONE,
): number {
  const { year, month, day } = calendarDateParts(reference.getTime(), timeZone);
  return timestampFromCalendarParts(year, month, day);
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Friday of the ISO week (Mon–Sun) in the calendar time zone. */
export function fridayOfCurrentWeek(
  reference = new Date(),
  timeZone = CALENDAR_TIME_ZONE,
): number {
  const today = todayCalendarTimestamp(reference, timeZone);
  const weekdayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone,
  }).format(reference);
  const weekday = WEEKDAY_INDEX[weekdayLabel] ?? 0;
  const daysSinceMonday = (weekday + 6) % 7;
  return today - daysSinceMonday * MS_PER_DAY + 4 * MS_PER_DAY;
}
