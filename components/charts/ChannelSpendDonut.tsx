import type { AnalysisResult } from "@/lib/types";

// Same validated categorical order used for the trend charts (lib/trends.ts)
// - kept identical here so a channel's color means the same thing everywhere
// in the app.
const CHANNEL_COLORS = ["#b3541e", "#1f5f9e", "#a0266b", "#0891b2", "#5b3fa0"];
const OTHER_COLOR = "#8a8478";
const MAX_SLICES = CHANNEL_COLORS.length;

const SIZE = 200;
const STROKE = 34;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP_DEG = 2;

export default function ChannelSpendDonut({
  channelMix,
}: {
  channelMix: AnalysisResult["documentSummary"]["channelMix"];
}) {
  const withSpend = channelMix.filter((c) => c.spendNumeric != null && c.spendNumeric > 0);
  // Need at least two priced channels for a split to mean anything - one
  // slice alone is just the total, and any fewer isn't a real breakdown.
  if (withSpend.length < 2) return null;

  const total = withSpend.reduce((sum, c) => sum + (c.spendNumeric as number), 0);
  const ranked = [...withSpend].sort((a, b) => (b.spendNumeric as number) - (a.spendNumeric as number));
  const top = ranked.slice(0, MAX_SLICES);
  const rest = ranked.slice(MAX_SLICES);
  const restTotal = rest.reduce((sum, c) => sum + (c.spendNumeric as number), 0);

  const slices = top.map((c, i) => ({
    label: c.channel,
    value: c.spendNumeric as number,
    color: CHANNEL_COLORS[i],
  }));
  if (restTotal > 0) {
    slices.push({ label: "Other", value: restTotal, color: OTHER_COLOR });
  }

  let cursor = 0;
  const arcs = slices.map((s) => {
    const fraction = s.value / total;
    const dash = Math.max(fraction * CIRCUMFERENCE - GAP_DEG, 0);
    const offset = -cursor * CIRCUMFERENCE;
    cursor += fraction;
    return { ...s, fraction, dash, offset };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-44 w-44 shrink-0 -rotate-90"
        role="img"
        aria-label="Spend by channel"
      >
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#e4e0d7" strokeWidth={STROKE} />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={a.color}
            strokeWidth={STROKE}
            strokeDasharray={`${a.dash} ${CIRCUMFERENCE - a.dash}`}
            strokeDashoffset={a.offset}
            strokeLinecap="round"
          >
            <title>{`${a.label}: $${a.value.toLocaleString()} (${Math.round(a.fraction * 100)}%)`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex flex-col gap-1.5 w-full">
        {arcs.map((a) => (
          <div key={a.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink-soft min-w-0">
              <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
              <span className="truncate">{a.label}</span>
            </span>
            <span className="shrink-0 font-medium text-ink">
              ${a.value.toLocaleString()} <span className="text-ink-soft font-normal">({Math.round(a.fraction * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
