export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-24">
      <div className="w-full max-w-xl">
        {/* Wordmark */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-charcoal">
            zanshin
          </span>
          <span className="text-2xl font-bold text-coral">.</span>
          <span className="ml-2 text-xs italic text-linen">
            残心 · remaining mind
          </span>
        </div>

        {/* Description */}
        <p className="mt-8 text-base leading-relaxed text-charcoal-soft">
          Async standup for small teams. One main goal, one weekly slice, one
          thing today. Sixty seconds a day, total.
        </p>

        {/* Phase indicator */}
        <div className="mt-10 inline-flex items-center gap-2 rounded-pill border border-mist bg-white px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          <span className="text-xs font-semibold tracking-widest text-charcoal-soft uppercase">
            Phase 1 · scaffold
          </span>
        </div>

        {/* Token verification — color swatches */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-0.5 w-3 bg-coral" />
            <span className="text-[10px] font-bold tracking-[1.4px] text-linen uppercase">
              Tokens loaded
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <Swatch name="coral" value="#ED6A5A" className="bg-coral" />
            <Swatch
              name="charcoal"
              value="#353535"
              className="bg-charcoal"
              dark
            />
            <Swatch name="mist" value="#D2D7DF" className="bg-mist" />
            <Swatch
              name="mist-soft"
              value="#EDF0F4"
              className="bg-mist-soft"
            />
            <Swatch name="linen" value="#BDBBB0" className="bg-linen" />
            <Swatch name="page" value="#FAFAF8" className="bg-page" />
            <Swatch name="white" value="#FFFFFF" className="bg-white" />
            <Swatch
              name="charcoal-soft"
              value="#5C5C5C"
              className="bg-charcoal-soft"
              dark
            />
            <Swatch name="green" value="#3E8A4F" className="bg-green" dark />
            <Swatch name="purple" value="#7E57C2" className="bg-purple" dark />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-16 text-xs italic text-linen">
          If you can read this in Inter, the tokens are wired. Up next: real
          auth.
        </p>
      </div>
    </main>
  );
}

function Swatch({
  name,
  value,
  className,
  dark = false,
}: {
  name: string;
  value: string;
  className: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`h-12 rounded-input border border-mist ${className}`}
        aria-label={`${name} ${value}`}
      />
      <span className="text-[10px] font-medium text-charcoal">{name}</span>
      <span className="text-[9px] text-linen font-mono">{value}</span>
    </div>
  );
}
