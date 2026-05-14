"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import type { DashboardData } from "@/lib/dashboard-data";
import { dropShip, reviewShip } from "@/app/actions/ship-actions";

const COLLAPSED_KEY = "zanshin:shippedCollapsed";

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
    return new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [needsEyes, setNeedsEyes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSED_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {}
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || pending) return;
    setError(null);

    startTransition(async () => {
      const result = await dropShip({
        description,
        link: link.trim() || undefined,
        needsEyes,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDescription("");
      setLink("");
      setShowLink(false);
      setNeedsEyes(false);
      router.refresh();
    });
  }

  function handleReview(shipId: string) {
    startTransition(async () => {
      await reviewShip(shipId);
      router.refresh();
    });
  }

  if (collapsed) {
    return (
      <aside className="flex w-[48px] shrink-0 flex-col items-center bg-mist-soft py-5">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Expand shipped rail"
          className="flex h-8 w-8 items-center justify-center rounded-md text-charcoal-soft hover:bg-mist hover:text-coral"
        >
          ‹
        </button>
        <div className="mt-3 flex flex-1 flex-col items-center gap-2">
          <span
            className="text-[11px] font-bold tracking-[2.2px] text-coral uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Shipped
          </span>
          <span className="text-[10px] italic text-linen">
            {ships.length}
          </span>
        </div>
      </aside>
    );
  }

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
        <div className="flex items-center gap-2">
          <span className="text-[11px] italic text-linen">
            {ships.length} {ships.length === 1 ? "ship" : "ships"}
          </span>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse shipped rail"
            className="flex h-6 w-6 items-center justify-center rounded-md text-charcoal-soft hover:bg-mist hover:text-coral"
          >
            ›
          </button>
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="mt-3.5 rounded-input border border-mist bg-white p-3.5"
      >
        <span className="text-[9px] font-bold tracking-[1.6px] text-coral uppercase">
          Drop a ship
        </span>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you ship?"
          disabled={pending}
          rows={3}
          maxLength={1000}
          className="mt-2.5 min-h-[54px] w-full resize-none rounded-md border border-mist bg-page px-3 py-2.5 text-xs leading-relaxed text-charcoal placeholder:italic placeholder:text-linen focus:border-coral focus:outline-none disabled:opacity-50"
        />

        {/* Link input — collapsible */}
        {showLink && (
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            disabled={pending}
            className="mt-2 w-full rounded-md border border-mist bg-page px-3 py-1.5 text-xs text-charcoal placeholder:text-linen focus:border-coral focus:outline-none disabled:opacity-50"
          />
        )}

        {/* Options row */}
        <div className="mt-2.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLink((v) => !v)}
            className={`text-[11px] font-medium ${showLink ? "text-coral" : "text-charcoal-soft hover:text-charcoal"}`}
          >
            {showLink ? "✓ link" : "+ link"}
          </button>
          <button
            type="button"
            onClick={() => setNeedsEyes((v) => !v)}
            className={`text-[11px] font-medium ${needsEyes ? "text-coral" : "text-charcoal-soft hover:text-charcoal"}`}
          >
            👁️ needs eyes
          </button>
        </div>

        {error && (
          <p className="mt-2 text-[11px] italic text-coral">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending || !description.trim()}
          className="mt-2.5 inline-flex h-9 w-full items-center justify-center rounded-md bg-charcoal text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Shipping…" : "Ship it →"}
        </button>
      </form>

      {/* Ship list */}
      <div className="mt-3.5 space-y-2.5">
        {ships.length === 0 ? (
          <div className="rounded-input border border-dashed border-mist bg-page px-4 py-6 text-center">
            <p className="text-xs italic text-linen leading-relaxed">
              Ships you and your team finish will show up here in reverse-chrono
              order.
            </p>
          </div>
        ) : (
          ships.map((s) => {
            const authorName = s.author.display_name || "—";
            const reviewed = s.reviews.length > 0;
            const isMine = s.author.user_id === currentUserId;
            const canReview = !isMine && s.needs_eyes && !reviewed;
            return (
              <article
                key={s.id}
                className={`rounded-input border bg-white p-3 ${s.needs_eyes && !reviewed ? "border-coral" : "border-mist"}`}
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
                    {isMine && (
                      <span className="text-[9px] italic text-coral">(you)</span>
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
                {(s.link || reviewed || canReview) && (
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    {s.link ? (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-linen hover:text-charcoal-soft"
                      >
                        <span>🔗</span>
                        <span className="truncate">{hostFromUrl(s.link)}</span>
                      </a>
                    ) : (
                      <span />
                    )}
                    {reviewed ? (
                      <span className="inline-flex items-center gap-1 text-charcoal-soft">
                        <span>✓</span> seen
                      </span>
                    ) : (
                      canReview && (
                        <button
                          type="button"
                          onClick={() => handleReview(s.id)}
                          disabled={pending}
                          className="rounded-md border border-mist bg-white px-2 py-0.5 font-semibold text-charcoal hover:border-coral hover:text-coral disabled:opacity-50"
                        >
                          mark seen
                        </button>
                      )
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
