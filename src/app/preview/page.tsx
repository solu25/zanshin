import Link from "next/link";

export default function PreviewIndex() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-coral">
          Zanshin · Dashboard Preview
        </p>
        <h1 className="mt-3 text-2xl font-medium tracking-tight text-charcoal">
          The new design
        </h1>
        <p className="mt-2 text-sm italic text-linen">
          Pinned weekly goal · last-week recap · today list · day rail
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/preview/filled"
          className="rounded-input border-[1.5px] border-coral bg-white px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-coral/[.06]"
        >
          Filled state →
        </Link>
        <Link
          href="/preview/empty"
          className="rounded-input border border-mist bg-white px-6 py-3 text-sm font-medium text-charcoal-soft transition-colors hover:border-coral hover:text-charcoal"
        >
          Empty state →
        </Link>
      </div>

      <p className="text-xs italic text-linen">
        Designed at 1920×1080. Best viewed on a wide screen.
      </p>
    </main>
  );
}
