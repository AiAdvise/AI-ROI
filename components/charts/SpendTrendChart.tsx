export interface SpendTrendPoint {
  label: string;
  value: number;
}

const WIDTH = 640;
const HEIGHT = 220;
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

export default function SpendTrendChart({
  points,
  color = "#b3541e",
  ariaLabel = "Total spend over time",
}: {
  points: SpendTrendPoint[];
  /** Decorative line/dot color - defaults to the spend-chart accent. Pass a
   * distinct validated color when reusing this component for a different
   * dollar-denominated series (e.g. revenue) so the two don't look identical
   * when shown side by side. */
  color?: string;
  ariaLabel?: string;
}) {
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  if (points.length < 2) return null;

  const maxValue = niceCeil(Math.max(...points.map((p) => p.value)) * 1.15);
  const stepX = plotW / (points.length - 1);

  const xy = (i: number, value: number) => ({
    x: PAD_LEFT + i * stepX,
    y: PAD_TOP + plotH - (value / maxValue) * plotH,
  });

  const linePath = points
    .map((p, i) => {
      const { x, y } = xy(i, p.value);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const last = points[points.length - 1];
  const lastPos = xy(points.length - 1, last.value);

  // Thin x-axis labels so they don't collide when there are many reports.
  const labelEvery = Math.ceil(points.length / 6);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label={ariaLabel}>
      {gridLines.map((g) => {
        const y = PAD_TOP + plotH - g * plotH;
        return (
          <line
            key={g}
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={y}
            y2={y}
            stroke="#e4e0d7"
            strokeWidth={1}
          />
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

      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => {
        const { x, y } = xy(i, p.value);
        return (
          <circle key={i} cx={x} cy={y} r={4} fill={color} stroke="#ffffff" strokeWidth={2}>
            <title>{`${p.label}: $${p.value.toLocaleString()}`}</title>
          </circle>
        );
      })}

      <text x={lastPos.x} y={lastPos.y - 12} textAnchor="end" fontSize={12} fontWeight={600} fill="#1c2434">
        ${last.value.toLocaleString()}
      </text>

      {points.map((p, i) => {
        if (i % labelEvery !== 0 && i !== points.length - 1) return null;
        const { x } = xy(i, p.value);
        return (
          <text key={i} x={x} y={HEIGHT - 8} textAnchor="middle" fontSize={11} fill="#3d465a">
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}
