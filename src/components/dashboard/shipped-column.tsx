import { Avatar } from "@/components/avatar";
import type { DashboardData } from "@/lib/dashboard-data";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function hostFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 30);
  }
}

export function ShippedColumn({
  ships,
  currentUserId,
}: {
  ships: DashboardData["recentShips"];
  currentUserId: string;
}) {
  return (
    <aside className="flex w-[380px] shrink-0 flex-col bg-mist-soft px-[22px] py-7 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-3.5 bg-coral" />
          <span className="text-[11px] font-bold tracking-[2.2px] text-coral uppercase">
            Shipped
          </span>
        </div>
        <span className="text-[11px] italic text-linen">
          {ships.length} {ships.length === 1 ? "ship" : "ships"}
        </span>
      </div>

      {/* Composer */}
      <div className="mt-3.5 rounded-input border border-mist bg-white p-3.5">
        <span className="text-[9px] font-bold tracking-[1.6px] text-coral uppercase">
          Drop a ship
        </span>
        <div className="mt-2.5 min-h-[54px] rounded-md border border-mist bg-page px-3 py-2.5">
          <span className="text-xs italic text-linen">
            What did you ship?
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="text-[11px] font-medium text-charcoal-soft">
            + link
          </span>
          <span className="text-[11px] font-medium text-charcoal-soft">
            👁️ needs eyes
          </span>
        </div>
        <button
          type="button"
          disabled
          className="mt-2.5 inline-flex h-9 w-full items-center justify-center rounded-md bg-charcoal text-xs font-semibold text-white opacity-40"
        >
          Ship it →
        </button>
      </div>

      {/* Ship list */}
      <div className="mt-3.5 space-y-2.5">
        {ships.length === 0 ? (
          <div className="rounded-input border border-dashed border-mist bg-page px-4 py-6 text-center">
            <p className="text-xs italic text-linen leading-relaxed">
              Ships you and your team finish will show up here in reverse-chrono order.
            </p>
          </div>
        ) : (
          ships.map((s) => {
            const authorName = s.author.display_name || "—";
            const reviewed = s.reviews.length > 0;
            return (
              <article
                key={s.id}
                className={`rounded-input border bg-white p-3 ${
                  s.needs_eyes && !reviewed ? "border-coral" : "border-mist"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={authorName}
                      color={s.author.avatar_color}
                      size="xs"
                    />
                    <span className="text-[11px] font-medium text-charcoal">
                      {authorName}
                    </span>
                    {s.author.user_id === currentUserId && (
                      <span className="text-[9px] italic text-coral">
                        (you)
                      </span>
                    )}
                  </div>
                  {s.needs_eyes && !reviewed ? (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-coral/10 px-2 py-0.5 text-[9px] font-bold tracking-[0.8px] text-coral uppercase">
                      <span>👁️</span> needs eyes
                    </span>
                  ) : (
                    <span className="text-[10px] italic text-linen">
                      {relativeTime(s.shipped_at)}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-snug text-charcoal">
                  {s.description}
                </p>
                {(s.link || reviewed) && (
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    {s.link ? (
                      <span className="inline-flex items-center gap-1 text-linen">
                        <span>🔗</span>
                        <span className="truncate">{hostFromUrl(s.link)}</span>
                      </span>
                    ) : (
                      <span />
                    )}
                    {reviewed && (
                      <span className="inline-flex items-center gap-1 text-charcoal-soft">
                        <span>✓</span> seen
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
}
