import type { ChannelComparisonRow } from "@/lib/compare";

const WIDTH = 640;
const ROW_HEIGHT = 40;
const PAD_TOP = 12;
const PAD_BOTTOM = 12;
const LABEL_W = 160;
const PAD_RIGHT = 64;

export default function ChannelDumbbellChart({
  rows,
  earlierLabel,
  laterLabel,
}: {
  rows: ChannelComparisonRow[];
  earlierLabel: string;
  laterLabel: string;
}) {
  const comparable = rows.filter(
    (r) => r.status === "both" && r.earlierSpend != null && r.laterSpend != null,
  ) as (ChannelComparisonRow & { earlierSpend: number; laterSpend: number })[];

  if (comparable.length === 0) return null;

  const plotW = WIDTH - LABEL_W - PAD_RIGHT;
  const maxValue = Math.max(...comparable.flatMap((r) => [r.earlierSpend, r.laterSpend])) * 1.15;
  const height = PAD_TOP + PAD_BOTTOM + comparable.length * ROW_HEIGHT;

  const xFor = (value: number) => LABEL_W + (value / maxValue) * plotW;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Channel spend, earlier vs later"
      >
        {comparable.map((r, i) => {
          const y = PAD_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2;
          const x1 = xFor(r.earlierSpend);
          const x2 = xFor(r.laterSpend);
          return (
            <g key={i}>
              <text x={LABEL_W - 12} y={y + 4} textAnchor="end" fontSize={12} fill="#1c2434" fontWeight={500}>
                {r.channel}
              </text>
              <line x1={x1} x2={x2} y1={y} y2={y} stroke="#e4e0d7" strokeWidth={2} />
              <circle cx={x1} cy={y} r={5} fill="#f0c9a4" stroke="#ffffff" strokeWidth={2}>
                <title>{`${earlierLabel}: $${r.earlierSpend.toLocaleString()}`}</title>
              </circle>
              <circle cx={x2} cy={y} r={5} fill="#b3541e" stroke="#ffffff" strokeWidth={2}>
                <title>{`${laterLabel}: $${r.laterSpend.toLocaleString()}`}</title>
              </circle>
              <text
                x={Math.max(x1, x2) + 12}
                y={y + 4}
                fontSize={11}
                fill="#3d465a"
              >
                ${r.laterSpend.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#f0c9a4" }} />
          {earlierLabel}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#b3541e" }} />
          {laterLabel}
        </span>
      </div>
    </div>
  );
}
