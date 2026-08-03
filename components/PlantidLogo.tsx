// Signature mark: a stylised specimen leaf pressed into an ochre-cornered
// herbarium label. Renders as inline SVG so it scales without a favicon
// round-trip and inherits currentColor for hover states.

export function PlantidLogo({
  className = "h-6 w-6",
  withWordmark = false,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className={className}
        aria-hidden
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="2"
          className="stroke-ochre-500"
          strokeWidth="1.5"
        />
        {/* corner mounting marks (herbarium tag) */}
        <path d="M6 2v3M6 30v-3M26 2v3M26 30v-3M2 6h3M2 26h3M30 6h-3M30 26h-3"
          className="stroke-ochre-500" strokeWidth="1.2" strokeLinecap="round" />
        {/* leaf silhouette */}
        <path
          d="M11 22 C 11 14, 17 8, 23 8 C 23 15, 18 22, 11 22 Z"
          className="fill-moss-500"
        />
        {/* mid vein */}
        <path
          d="M11 22 C 15 18, 19 14, 23 8"
          className="stroke-ink-950 dark:stroke-ink-950"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
        {/* small dew-drop / stamp accent */}
        <circle cx="9" cy="9" r="1.5" className="fill-ochre-500" />
      </svg>
      {withWordmark && (
        <span className="font-display text-xl tracking-tight">
          Plant<span className="text-moss-500 dark:text-moss-400">i</span>D
        </span>
      )}
    </span>
  );
}
