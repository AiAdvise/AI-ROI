import type { ChannelSeries } from "@/lib/trends";

const WIDTH = 640;
const HEIGHT = 260;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;

function niceCeil(n: number): number {
  if (n <= 0) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const frac = n / base;
  const niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return niceFrac * base;
}

export default function ChannelTrendChart({ series }: { series: ChannelSeries[] }) {
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const pointCount = series[0]?.points.length ?? 0;
  if (series.length === 0 || pointCount < 2) return null;

  const allValues = series.flatMap((s) => s.points.map((p) => p.value)).filter((v): v is number => v != null);
  if (allValues.length === 0) return null;

  const maxValue = niceCeil(Math.max(...allValues) * 1.15);
  const stepX = plotW / (pointCount - 1);

  const xAt = (i: number) => PAD_LEFT + i * stepX;
  const yAt = (value: number) => PAD_TOP + plotH - (value / maxValue) * plotH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = Math.ceil(pointCount / 6);

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Channel spend over time"
      >
        {gridLines.map((g) => {
          const y = PAD_TOP + plotH - g * plotH;
          return (
            <line key={g} x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} stroke="#e4e0d7" strokeWidth={1} />
          );
        })}
        {gridLines.map((g) => {
          const y = PAD_TOP + plotH - g * plotH;
          return (
            <text key={g} x={PAD_LEFT - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#3d465a">
              ${Math.round(maxValue * g).toLocaleString()}
            </text>
          );
        })}

        {series.map((s) => {
          const known = s.points
            .map((p, i) => ({ ...p, i }))
            .filter((p): p is { label: string; value: number; i: number } => p.value != null);
          if (known.length === 0) return null;

          const path = known
            .map((p, idx) => `${idx === 0 ? "M" : "L"}${xAt(p.i).toFixed(1)},${yAt(p.value).toFixed(1)}`)
            .join(" ");

          return (
            <g key={s.channel}>
              <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {known.map((p) => (
                <circle key={p.i} cx={xAt(p.i)} cy={yAt(p.value)} r={4} fill={s.color} stroke="#ffffff" strokeWidth={2}>
                  <title>{`${s.channel} - ${p.label}: $${p.value.toLocaleString()}`}</title>
                </circle>
              ))}
            </g>
          );
        })}

        {series[0].points.map((p, i) => {
          if (i % labelEvery !== 0 && i !== pointCount - 1) return null;
          return (
            <text key={i} x={xAt(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={11} fill="#3d465a">
              {p.label}
            </text>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        {series.map((s) => (
          <span key={s.channel} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.channel}
          </span>
        ))}
      </div>
    </div>
  );
}
