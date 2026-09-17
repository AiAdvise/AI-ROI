const CHANNELS = [
  {
    name: "Pre-Roll/OLV",
    color: "#b3541e",
    summary: "9,287 impressions, 6 clicks, 6 visits, 2,757 completions",
    kpis: [
      { label: "Impressions", value: "9,287" },
      { label: "Clicks", value: "6 (0.06%)" },
      { label: "Site visits", value: "6 (0.06%)" },
      { label: "Completion rate", value: "29.69%" },
    ],
  },
  {
    name: "Search Ads (SEM)",
    color: "#1d6fd6",
    summary: "3,219 impressions, 326 clicks, 4 calls",
    kpis: [
      { label: "Impressions", value: "3,219" },
      { label: "Clicks", value: "326 (10.13%)" },
      { label: "Calls", value: "4" },
    ],
  },
  {
    name: "CTV/OTT",
    color: "#d3348e",
    summary: "21,992 impressions, 21,001 completions; household site visits listed as no data available",
    kpis: [
      { label: "Impressions", value: "21,992" },
      { label: "Completion rate", value: "95.49%" },
      { label: "Household visits", value: "No Data Available" },
    ],
  },
];

export default function ChannelPerformancePreview() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
        How each tactic performed
      </p>
      <h3 className="gradient-text mt-1 font-serif text-2xl font-semibold">Channel performance</h3>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {CHANNELS.map((c) => (
          <div
            key={c.name}
            className="rounded-xl border border-line bg-paper-raised p-4 shadow-sm"
            style={{ borderTop: `3px solid ${c.color}` }}
          >
            <h4 className="font-medium text-ink">{c.name}</h4>
            <p className="mt-1 text-sm text-ink-soft">{c.summary}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {c.kpis.map((k) => (
                <div key={k.label} className="rounded-lg bg-paper p-2.5">
                  <p className="truncate text-[11px] uppercase tracking-wide text-ink-soft">
                    {k.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">{k.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
