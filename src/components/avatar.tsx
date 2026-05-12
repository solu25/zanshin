import type { ReactNode } from "react";

const COLOR_CLASSES: Record<string, string> = {
  coral: "bg-coral text-white",
  purple: "bg-purple text-white",
  green: "bg-green text-white",
  charcoal: "bg-charcoal text-white",
  linen: "bg-linen text-charcoal",
};

const SIZE_CLASSES = {
  xs: "h-4 w-4 text-[8px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

export function Avatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}): ReactNode {
  const initial = (name || "?").charAt(0).toUpperCase();
  const palette = COLOR_CLASSES[color] ?? COLOR_CLASSES.coral;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-pill font-semibold ${palette} ${SIZE_CLASSES[size]} ${className ?? ""}`}
      aria-label={name}
    >
      {initial}
    </span>
  );
}
