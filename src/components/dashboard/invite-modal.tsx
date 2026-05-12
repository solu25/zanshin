"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendInvite } from "@/app/actions/team-actions";

export function InviteModal({
  open,
  onClose,
  teamName,
}: {
  open: boolean;
  onClose: () => void;
  teamName: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus the input + reset state on open
  useEffect(() => {
    if (open) {
      setEmail("");
      setError(null);
      setSent(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await sendInvite(email.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(email);
      setEmail("");
      router.refresh();
    });
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Invite teammates"
    >
      <div className="w-full max-w-md rounded-card border border-mist bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="h-0.5 w-3 bg-coral" />
              <span className="text-[10px] font-bold tracking-[1.8px] text-coral uppercase">
                Invite to {teamName}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-medium tracking-tight text-charcoal">
              Who&apos;s in with you?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-linen hover:text-charcoal-soft"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-sm italic text-linen leading-relaxed">
          They&apos;ll get a single-use sign-in link. No password.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label
            htmlFor="invite-email"
            className="block text-[10px] font-bold tracking-[1.8px] text-charcoal-soft uppercase"
          >
            Email
          </label>
          <input
            id="invite-email"
            ref={inputRef}
            type="email"
            required
            placeholder="teammate@team.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            className="w-full rounded-input border border-mist bg-white px-4 py-3 text-base text-charcoal placeholder:text-linen focus:border-coral focus:outline-none disabled:opacity-50"
          />

          {error && <p className="text-xs italic text-coral">{error}</p>}
          {sent && (
            <p className="text-xs italic text-charcoal-soft">
              ✓ Invite sent to <span className="font-medium">{sent}</span>
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="text-sm font-medium text-linen hover:text-charcoal-soft"
            >
              Done
            </button>
            <button
              type="submit"
              disabled={pending || !email.trim()}
              className="rounded-input bg-charcoal px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {pending ? "Sending…" : "Send →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
