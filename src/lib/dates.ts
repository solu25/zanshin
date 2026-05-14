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

/**
 * Returns the YYYY-MM-DD date string for "today" in the user's local time.
 * Date-only — no timezone shift.
 */
export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Add `days` calendar days to a YYYY-MM-DD date string, return YYYY-MM-DD.
 * Local-time math so it doesn't drift across DST.
 */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

/**
 * Compute the rolling YOUR WEEK SO FAR trail dates centered on today.
 *
 * - If today is Monday: shows last Thursday + Friday + today + tomorrow
 * - If today is Tue–Fri: shows the past days of THIS week so far + today + tomorrow
 *
 * Always returns 4 dates so the trail UI has 4 slots.
 */
export function weekTrailDates(today: Date = new Date()): string[] {
  const todayStr = todayISO(today);
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, …

  if (dayOfWeek === 1) {
    // Monday — reach back to last Thursday + Friday
    return [
      addDaysISO(todayStr, -4), // last Thu
      addDaysISO(todayStr, -3), // last Fri
      todayStr,
      addDaysISO(todayStr, 1), // Tuesday
    ];
  }

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Sun/Sat — weekend view: show last week's Thu/Fri + this past Mon + today
    const lastMonday = addDaysISO(todayStr, dayOfWeek === 0 ? -6 : -5);
    return [
      addDaysISO(lastMonday, -4),
      addDaysISO(lastMonday, -3),
      lastMonday,
      todayStr,
    ];
  }

  // Tue–Fri — show this week's days leading up to today + tomorrow
  // Backfill from today to fit 3 past slots + today + 1 future = pick the 4 most relevant
  const monday = addDaysISO(todayStr, -(dayOfWeek - 1));
  const trail: string[] = [];
  for (let i = 0; trail.length < 3 && i < 5; i++) {
    const d = addDaysISO(monday, i);
    if (d < todayStr) trail.push(d);
  }
  trail.push(todayStr);
  if (trail.length < 4) trail.push(addDaysISO(todayStr, 1));
  return trail.slice(0, 4);
}

/**
 * Workdays of THIS week that fall after today (Mon–Fri).
 * - Mon today → [Tue, Wed, Thu, Fri]
 * - Tue today → [Wed, Thu, Fri]
 * - Fri today / weekend → []
 */
export function restOfWorkweekDates(today: Date = new Date()): string[] {
  const todayStr = todayISO(today);
  const day = today.getDay(); // 0 = Sun .. 6 = Sat
  const monday = addDaysISO(todayStr, day === 0 ? -6 : -(day - 1));
  const out: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = addDaysISO(monday, i);
    if (d > todayStr) out.push(d);
  }
  return out;
}

/**
 * 5 YYYY-MM-DD strings for last week's Mon–Fri, in reverse-chronological order:
 * [last Fri, last Thu, last Wed, last Tue, last Mon].
 *
 * "Last week" = the calendar workweek ending on the most recent Sunday-or-before.
 * - If today is Mon: walks back to last Sunday, then to its preceding Mon.
 * - If today is Sun: this Sunday IS the boundary; walks to the Mon 6 days before.
 */
export function lastWorkweekDates(today: Date = new Date()): string[] {
  const todayStr = todayISO(today);
  const day = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Walk back to the most recent Sunday (today if Sunday, else previous Sunday)
  const lastSunday = addDaysISO(todayStr, day === 0 ? 0 : -day);
  // Last week's Mon is 6 days before that Sunday
  const lastMon = addDaysISO(lastSunday, -6);
  return [
    addDaysISO(lastMon, 4), // last Fri
    addDaysISO(lastMon, 3), // last Thu
    addDaysISO(lastMon, 2), // last Wed
    addDaysISO(lastMon, 1), // last Tue
    lastMon, // last Mon
  ];
}

/**
 * Returns the short uppercase weekday + month-day label for a YYYY-MM-DD string.
 * Example: "2026-05-12" → "TUE · MAY 12"
 */
export function dayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const wd = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const md = date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
  return `${wd} · ${md}`;
}
