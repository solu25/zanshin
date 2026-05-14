import Link from "next/link";

type Step = "team" | "goal" | "week" | "tools";

const STEPS: { key: Step; label: string }[] = [
  { key: "team", label: "TEAM" },
  { key: "goal", label: "MAIN GOAL" },
  { key: "week", label: "THIS WEEK" },
  { key: "tools", label: "CONNECT" },
];

/**
 * 4-step coral stepper. Lifted from Pencil P2/P3/P4/P5.
 *
 * - `current` highlights with a coral number circle
 * - earlier (done) steps are clickable Links — navigate back via ?edit=1
 *   so the destination page bypasses its auto-skip-forward redirect
 * - later steps are linen (muted), not clickable
 */
export function OnboardingStepper({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-2 justify-center">
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;

        const inner = (
          <div className="flex items-center gap-2">
            <span
              className={`h-0.5 w-3 ${
                isDone || isCurrent ? "bg-coral" : "bg-mist"
              }`}
            />
            <div className="flex items-center gap-1.5">
              {isDone ? (
                <span className="text-[11px] font-bold text-coral">✓</span>
              ) : (
                <span
                  className={`text-[11px] font-bold ${
                    isCurrent ? "text-coral" : "text-linen"
                  }`}
                >
                  {i + 1}
                </span>
              )}
              <span
                className={`text-[10px] font-bold tracking-[1.8px] uppercase transition-colors ${
                  isCurrent
                    ? "text-coral"
                    : isDone
                      ? "text-charcoal-soft group-hover:text-coral"
                      : "text-linen"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );

        return (
          <div key={step.key} className="flex items-center gap-2">
            {isDone ? (
              <Link
                href={`/onboarding/${step.key}?edit=1`}
                className="group rounded-md px-1.5 py-1 transition-colors hover:bg-mist-soft"
                aria-label={`Go back to ${step.label.toLowerCase()} step`}
              >
                {inner}
              </Link>
            ) : (
              <div className="px-1.5 py-1">{inner}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export type { Step as OnboardingStep };
