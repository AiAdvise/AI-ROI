export interface BarPoint {
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
}

const PAD_LEFT = 44;
const PAD_RIGHT = 8;
const PAD_TOP = 20;
const PAD_BOTTOM = 28;
const BAR_GAP = 6;

function niceCeil(n: number): number {
  if (n <= 0) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const frac = n / base;
  const niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return niceFrac * base;
}

export default function MetricBarChart({
  points,
  color,
  formatValue,
  ariaLabel,
  width = 320,
  height = 200,
}: {
  points: BarPoint[];
  color: string;
  formatValue: (v: number) => string;
  ariaLabel: string;
  /** SVG viewBox dimensions - only their ratio matters (the chart always
   * renders at the container's width). Defaults suit a half-width card;
   * pass a wider ratio (e.g. 640x200) for a full-width chart. */
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;

  const WIDTH = width;
  const HEIGHT = height;
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = niceCeil(Math.max(...points.map((p) => p.value)) * 1.15);
  const barW = (plotW - BAR_GAP * (points.length - 1)) / points.length;
  const gridLines = [0, 0.5, 1];

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label={ariaLabel}>
      {gridLines.map((g) => {
        const y = PAD_TOP + plotH - g * plotH;
        return (
          <line key={g} x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} stroke="#e4e0d7" strokeWidth={1} />
        );
      })}
      {gridLines.map((g) => {
        const y = PAD_TOP + plotH - g * plotH;
        return (
          <text key={g} x={PAD_LEFT - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#3d465a">
            {formatValue(maxValue * g)}
          </text>
        );
      })}

      {points.map((p, i) => {
        const x = PAD_LEFT + i * (barW + BAR_GAP);
        const h = Math.max((p.value / maxValue) * plotH, 2);
        const y = PAD_TOP + plotH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={3} fill={p.color ?? color}>
              <title>{p.tooltip ?? `${p.label}: ${formatValue(p.value)}`}</title>
            </rect>
            <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" fontSize={9} fill="#3d465a">
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
