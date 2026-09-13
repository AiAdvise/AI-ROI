import type { FunnelBreakdown } from "@/lib/funnel";

// Validated adjacent-safe trio (node scripts/validate_palette.js) in fixed
// upper->mid->lower order - never reorder or swap these hues per-report.
const STAGE_META: { key: "upper" | "mid" | "lower"; label: string; color: string }[] = [
  { key: "upper", label: "Upper funnel (awareness)", color: "#1f5f9e" },
  { key: "mid", label: "Mid funnel (consideration)", color: "#a0266b" },
  { key: "lower", label: "Lower funnel (conversion)", color: "#0891b2" },
];
// Deliberately low-chroma fold-in for the "couldn't classify" bucket - same
// gray already used for "Other" in ChannelTrendChart. Always last, always
// paired with a direct text label, so it's exempt from categorical hue
// separation (it isn't a peer category, just a labeled leftover).
const UNKNOWN_COLOR = "#8a8478";

export default function FunnelBar({ breakdown }: { breakdown: FunnelBreakdown }) {
  const segments = [
    ...STAGE_META.map((s) => ({ ...s, value: breakdown[s.key] })),
    ...(breakdown.unknown > 0.5
      ? [{ key: "unknown" as const, label: "Unclassified", color: UNKNOWN_COLOR, value: breakdown.unknown }]
      : []),
  ].filter((s) => s.value > 0.5);

  return (
    <div>
      <div className="flex h-8 w-full overflow-hidden rounded-full bg-line" role="img" aria-label="Funnel coverage by spend">
        {segments.map((s, i) => (
          <div
            key={s.key}
            style={{ width: `${s.value}%`, backgroundColor: s.color }}
            className={i > 0 ? "border-l-2 border-paper" : undefined}
            title={`${s.label}: ${Math.round(s.value)}%`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}: <span className="font-medium text-ink">{Math.round(s.value)}%</span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-soft/70">
        Weighted by {breakdown.byWeight}
        {breakdown.byWeight === "channel count" && " (spend wasn't broken out per channel in this report)"}.
      </p>
    </div>
  );
}
