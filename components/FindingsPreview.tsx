const SEVERITY_META = {
  high: {
    label: "High",
    card: "border-severe/30 bg-severe-soft",
    badge: "bg-severe text-white",
  },
  medium: {
    label: "Medium",
    card: "border-caution/30 bg-caution-soft",
    badge: "bg-caution text-white",
  },
};

const FINDINGS: { severity: keyof typeof SEVERITY_META; title: string; body: string; channel: string }[] = [
  {
    severity: "high",
    title: "Pre-Roll completion rate far below healthy range",
    body: "The Pre-Roll/OLV completion rate of 29.69% is well under the 50-70% benchmark range for this format. A low completion rate is a genuine diagnostic signal, pointing to creative mismatch, poor targeting, or a skippable placement running where non-skippable inventory was expected.",
    channel: "Pre-Roll/OLV",
  },
  {
    severity: "medium",
    title: "Thin lower-funnel conversion volume in SEM",
    body: "SEM is the only lower-funnel (conversion-focused) tactic in this report, and it only generated 4 calls from 3,219 impressions and 326 clicks in a full month. Whether this reflects a landing-page problem or simply a coverage gap can't be determined from the report alone.",
    channel: "Search Ads (SEM)",
  },
];

export default function FindingsPreview() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="mb-4 flex items-baseline gap-2.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">What we found</p>
          <h3 className="gradient-text mt-1 font-serif text-2xl font-semibold">Findings</h3>
        </div>
        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink-soft">4</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {FINDINGS.map((flag, i) => {
          const meta = SEVERITY_META[flag.severity];
          return (
            <div key={flag.title} className={`rounded-lg border p-4 shadow-sm ${meta.card}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-sm text-ink-soft/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="font-medium text-ink">{flag.title}</h4>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${meta.badge}`}
                >
                  {meta.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{flag.body}</p>
              <p className="mt-2 text-xs text-ink-soft/70">Channel: {flag.channel}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-soft/70">+ 2 more findings in your full report</p>
    </div>
  );
}
