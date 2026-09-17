const ASSESSMENT_META = {
  above: {
    label: "Above benchmark - worth a look",
    card: "border-caution/30 bg-caution-soft",
    badge: "bg-caution text-white",
  },
  within: {
    label: "Within normal range",
    card: "border-good/30 bg-good-soft",
    badge: "bg-good text-white",
  },
  below: {
    label: "Below benchmark - worth a look",
    card: "border-caution/30 bg-caution-soft",
    badge: "bg-caution text-white",
  },
  insufficient_data: {
    label: "Can't calculate - report is missing data",
    card: "border-severe/30 bg-severe-soft",
    badge: "bg-severe text-white",
  },
};

const COMPARISONS: {
  assessment: keyof typeof ASSESSMENT_META;
  metric: string;
  reported: string;
  benchmark: string;
  commentary: string;
}[] = [
  {
    assessment: "below",
    metric: "Pre-Roll/OLV Completion Rate",
    reported: "29.69%",
    benchmark: "50.00%-70.00% (Plumbing Pre-Roll/OLV)",
    commentary:
      "This is meaningfully below the healthy range, suggesting a creative or targeting mismatch, or a skippable placement where non-skippable inventory was expected.",
  },
  {
    assessment: "within",
    metric: "CTV/OTT Completion Rate",
    reported: "95.49%",
    benchmark: "90.00%-97.00% (Plumbing CTV/OTT)",
    commentary:
      "This is within the expected range for non-skippable CTV inventory - a normal, not exceptional, result.",
  },
  {
    assessment: "above",
    metric: "Search Click-Through Rate (CTR)",
    reported: "10.13%",
    benchmark: "4.97%-5.50% (Plumbing Search CTR)",
    commentary:
      "The SEM ads are earning clicks at roughly double the typical plumbing benchmark - the ad copy/targeting for clicks appears to be working well.",
  },
  {
    assessment: "insufficient_data",
    metric: "Search Click-to-Call Conversion Rate",
    reported: "4 calls / 326 clicks",
    benchmark: "7.63%-15.00% (Plumbing Click-to-Call) - not computed here",
    commentary:
      "The report doesn't state whether these 4 calls came from people who visited the landing page from these clicks, or from a call extension/click-to-call button in the ad itself. Ask the agency to clarify before treating this as a landing-page conversion rate.",
  },
  {
    assessment: "insufficient_data",
    metric: "Search Cost Per Lead (CPL)",
    reported: "Not available - no spend data in report",
    benchmark: "$120-$170+ (non-branded PPC); LSA averages $45-$85 (Plumbing)",
    commentary: "This benchmark could be applied if spend figures were provided alongside the 4 reported calls.",
  },
];

export default function BenchmarkComparisonPreview() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
        How the numbers stack up
      </p>
      <h3 className="gradient-text mt-1 font-serif text-2xl font-semibold">Benchmark comparisons</h3>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {COMPARISONS.map((b) => {
          const meta = ASSESSMENT_META[b.assessment];
          return (
            <div key={b.metric} className={`rounded-lg border p-4 shadow-sm ${meta.card}`}>
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-medium text-ink">{b.metric}</h4>
                <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${meta.badge}`}>
                  {meta.label}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink-soft">
                Reported: <span className="font-medium text-ink">{b.reported}</span> - Benchmark:{" "}
                <span className="font-medium text-ink">{b.benchmark}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b.commentary}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
