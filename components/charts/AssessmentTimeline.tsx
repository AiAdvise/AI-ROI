export interface AssessmentPoint {
  label: string;
  assessment: "looks_reasonable" | "some_concerns" | "significant_concerns";
}

const STATUS_META: Record<AssessmentPoint["assessment"], { color: string; label: string }> = {
  looks_reasonable: { color: "#3f6b4a", label: "Looks reasonable" },
  some_concerns: { color: "#95610f", label: "Some concerns" },
  significant_concerns: { color: "#9f2b1f", label: "Significant concerns" },
};

const WIDTH = 640;
const HEIGHT = 96;
const PAD_X = 24;
const DOT_Y = 32;

export default function AssessmentTimeline({ points }: { points: AssessmentPoint[] }) {
  if (points.length < 2) return null;

  const plotW = WIDTH - PAD_X * 2;
  const stepX = plotW / (points.length - 1);
  const labelEvery = Math.ceil(points.length / 6);

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Overall assessment over time"
      >
        <line
          x1={PAD_X}
          x2={WIDTH - PAD_X}
          y1={DOT_Y}
          y2={DOT_Y}
          stroke="#e4e0d7"
          strokeWidth={1}
        />
        {points.map((p, i) => {
          const x = PAD_X + i * stepX;
          const meta = STATUS_META[p.assessment];
          return (
            <g key={i}>
              <circle cx={x} cy={DOT_Y} r={5} fill={meta.color} stroke="#ffffff" strokeWidth={2}>
                <title>{`${p.label}: ${meta.label}`}</title>
              </circle>
              {(i % labelEvery === 0 || i === points.length - 1) && (
                <text x={x} y={DOT_Y + 24} textAnchor="middle" fontSize={11} fill="#3d465a">
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        {Object.values(STATUS_META).map((meta) => (
          <span key={meta.label} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            {meta.label}
          </span>
        ))}
      </div>
    </div>
  );
}
