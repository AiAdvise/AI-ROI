"use client";

import { useState } from "react";

export interface BarPoint {
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
}

const PAD_LEFT = 44;
const PAD_RIGHT = 8;
const PAD_TOP = 28;
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

// A serializable format name rather than a formatter function - this
// component is a Client Component (it needs hover state), and the page
// rendering it is a Server Component, which can't pass a function prop
// across that boundary.
function formatByType(v: number, format: "compact" | "integer"): string {
  if (format === "compact" && v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(Math.round(v));
}

export default function MetricBarChart({
  points,
  color,
  format,
  ariaLabel,
  width = 320,
  height = 200,
}: {
  points: BarPoint[];
  color: string;
  format: "compact" | "integer";
  ariaLabel: string;
  /** SVG viewBox dimensions - only their ratio matters (the chart always
   * renders at the container's width). Defaults suit a half-width card;
   * pass a wider ratio (e.g. 640x200) for a full-width chart. */
  width?: number;
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

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
            {formatByType(maxValue * g, format)}
          </text>
        );
      })}

      {points.map((p, i) => {
        const x = PAD_LEFT + i * (barW + BAR_GAP);
        const h = Math.max((p.value / maxValue) * plotH, 2);
        const y = PAD_TOP + plotH - h;
        const isHovered = hovered === i;
        // Anchor the hover label to whichever edge of the bar keeps it
        // inside the chart, rather than always centering (which clips off
        // the right edge for the last bar with a long label).
        const labelAnchor = i === 0 ? "start" : i === points.length - 1 ? "end" : "middle";
        const labelX = labelAnchor === "start" ? x : labelAnchor === "end" ? x + barW : x + barW / 2;
        return (
          <g
            key={i}
            className="cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((cur) => (cur === i ? null : cur))}
            onTouchStart={() => setHovered(i)}
          >
            {/* Wider invisible hit area so the bar is easy to hover/tap even when short. */}
            <rect x={x} y={PAD_TOP} width={barW} height={plotH} fill="transparent" />
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={3}
              fill={p.color ?? color}
              opacity={hovered === null || isHovered ? 1 : 0.55}
              stroke={isHovered ? "#1c2434" : "none"}
              strokeWidth={isHovered ? 1.5 : 0}
            />
            {isHovered && (
              <text
                x={labelX}
                y={Math.max(y - 8, 11)}
                textAnchor={labelAnchor}
                fontSize={11}
                fontWeight={700}
                fill="#1c2434"
              >
                {p.tooltip ?? formatByType(p.value, format)}
              </text>
            )}
            <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" fontSize={9} fill="#3d465a">
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
