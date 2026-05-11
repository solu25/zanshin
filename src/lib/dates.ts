/**
 * Returns the Monday of the ISO week containing the given date,
 * formatted as YYYY-MM-DD (date-only string, no timezone).
 */
export function isoWeekMonday(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, …, 6 = Sat
  // Distance back to Monday: Sun->6, Mon->0, Tue->1, …, Sat->5
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
}
