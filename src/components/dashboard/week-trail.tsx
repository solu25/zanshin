import type { DashboardData } from "@/lib/dashboard-data";
import { todayISO } from "@/lib/dates";

function dayLabel(iso: string, today: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = date
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
  const monthDay = date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();

  if (iso === today) return `${dayName} · ${monthDay} · TODAY`;

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const daysDiff = Math.round((date.getTime() - todayDate.getTime()) / 86400000);

  // "LAST THU" if it's >=4 days ago, otherwise just the day name
  const prefix = daysDiff <= -4 ? "LAST " : "";
  return `${prefix}${dayName} · ${monthDay}`;
}

export function WeekTrail({ trail, currentUserId }: { trail: DashboardData["trail"]; currentUserId: string }) {
  const today = todayISO();

  return (
    <section>
      <div className="flex items-center gap-2">
        <span className="h-0.5 w-3.5 bg-linen" />
        <span className="text-[10px] font-bold tracking-[1.8px] text-linen uppercase">
          Your week so far · rolling
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {trail.map((day) => {
          const myEntry = day.entries.find((e) => e.user_id === currentUserId);

          // Today card: white bg, coral border
          if (day.is_today) {
            return (
              <div
                key={day.date}
                className="rounded-input border-[1.5px] border-coral bg-white px-3.5 py-2.5"
              >
                <div className="text-[9px] font-bold tracking-[1.2px] text-coral uppercase">
                  {dayLabel(day.date, today)}
                </div>
                <p className="mt-1 text-[11px] font-medium leading-snug text-charcoal">
                  {myEntry
                    ? myEntry.text
                    : "pick one to start ↑"}
                </p>
              </div>
            );
          }

          // Past day: mist-soft bg (filled if we have entry, page bg dashed if empty)
          if (day.is_past) {
            const hasEntry = !!myEntry;
            return (
              <div
                key={day.date}
                className={`rounded-input border px-3.5 py-2.5 ${hasEntry ? "border-mist bg-mist-soft" : "border-mist border-dashed bg-page"}`}
              >
                <div className={`text-[9px] font-bold tracking-[1.2px] uppercase ${hasEntry ? "text-linen" : "text-linen opacity-50"}`}>
                  {dayLabel(day.date, today)}
                </div>
                <p className={`mt-1 text-[11px] leading-snug ${hasEntry ? "text-charcoal-soft" : "text-linen italic opacity-50"}`}>
                  {myEntry?.text ?? "before you started"}
                </p>
              </div>
            );
          }

          // Future day: page bg
          return (
            <div
              key={day.date}
              className="rounded-input border border-mist bg-page px-3.5 py-2.5"
            >
              <div className="text-[9px] font-bold tracking-[1.2px] text-linen uppercase">
                {dayLabel(day.date, today)}
              </div>
              <p className="mt-1 text-[11px] italic text-linen leading-snug">
                yet to plan
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
