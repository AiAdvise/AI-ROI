import type { AnalysisResult } from "@/lib/types";

const SEVERITY_STYLES: Record<string, string> = {
  high: "border-red-300 bg-red-50 text-red-800",
  medium: "border-amber-300 bg-amber-50 text-amber-800",
  low: "border-gray-300 bg-gray-50 text-gray-700",
};

const ASSESSMENT_LABELS: Record<string, string> = {
  above: "Above benchmark",
  within: "Within normal range",
  below: "Below benchmark",
  no_benchmark_available: "No benchmark available",
};

const OVERALL_STYLES: Record<string, { label: string; className: string }> = {
  looks_reasonable: { label: "Looks reasonable", className: "bg-green-100 text-green-800" },
  some_concerns: { label: "Some concerns", className: "bg-amber-100 text-amber-800" },
  significant_concerns: { label: "Significant concerns", className: "bg-red-100 text-red-800" },
};

export default function ResultsView({ result }: { result: AnalysisResult }) {
  const overall = OVERALL_STYLES[result.overallAssessment];
  const { documentSummary } = result;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10">
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-semibold">Summary</h2>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${overall.className}`}>
            {overall.label}
          </span>
        </div>
        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
          {result.plainEnglishSummary}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          {documentSummary.businessType && (
            <div>
              <dt className="text-gray-500">Business type</dt>
              <dd className="font-medium">{documentSummary.businessType}</dd>
            </div>
          )}
          {documentSummary.reportingPeriod && (
            <div>
              <dt className="text-gray-500">Reporting period</dt>
              <dd className="font-medium">{documentSummary.reportingPeriod}</dd>
            </div>
          )}
          {documentSummary.totalSpend && (
            <div>
              <dt className="text-gray-500">Total spend</dt>
              <dd className="font-medium">{documentSummary.totalSpend}</dd>
            </div>
          )}
        </dl>

        {documentSummary.channelMix.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Channel</th>
                  <th className="py-2 pr-4">Spend</th>
                  <th className="py-2 pr-4">% of total</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {documentSummary.channelMix.map((c, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{c.channel}</td>
                    <td className="py-2 pr-4">{c.spend ?? "-"}</td>
                    <td className="py-2 pr-4">{c.percentOfTotal ?? "-"}</td>
                    <td className="py-2 text-gray-600">{c.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {documentSummary.reportedKpis.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Reported KPIs</h3>
            <ul className="text-sm space-y-1">
              {documentSummary.reportedKpis.map((k, i) => (
                <li key={i}>
                  <span className="font-medium">{k.name}:</span> {k.value}
                  {k.channel ? ` (${k.channel})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Red flags</h2>
        {result.redFlags.length === 0 ? (
          <p className="text-sm text-gray-500">No red flags identified.</p>
        ) : (
          <div className="space-y-3">
            {result.redFlags.map((flag, i) => (
              <div key={i} className={`rounded-lg border p-4 ${SEVERITY_STYLES[flag.severity]}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">{flag.title}</h3>
                  <span className="text-xs uppercase tracking-wide font-semibold shrink-0">
                    {flag.severity}
                  </span>
                </div>
                <p className="text-sm mt-1">{flag.reasoning}</p>
                {flag.relatedChannel && (
                  <p className="text-xs mt-2 opacity-70">Channel: {flag.relatedChannel}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Benchmark comparisons</h2>
        {result.benchmarkComparisons.length === 0 ? (
          <p className="text-sm text-gray-500">No benchmark comparisons available.</p>
        ) : (
          <div className="space-y-3">
            {result.benchmarkComparisons.map((b, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">{b.metric}</h3>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 shrink-0">
                    {ASSESSMENT_LABELS[b.assessment]}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Reported: <span className="font-medium">{b.reportedValue}</span> - Benchmark:{" "}
                  <span className="font-medium">{b.benchmarkRange}</span>
                </p>
                <p className="text-sm text-gray-800 mt-2">{b.commentary}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Questions to ask your agency</h2>
        <ol className="space-y-3 list-decimal list-inside">
          {result.questionsToAsk.map((q, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium text-gray-900">{q.question}</span>
              <p className="text-gray-600 mt-1 ml-5">{q.whyItMatters}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
