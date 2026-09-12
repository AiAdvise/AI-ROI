import type { AnalysisResult } from "@/lib/types";
import { ASSESSMENT_RANK, compareChannels, compareKpis, percentChange } from "@/lib/compare";

const OVERALL_META: Record<string, { label: string; badge: string }> = {
  looks_reasonable: { label: "Looks reasonable", badge: "bg-good-soft text-good" },
  some_concerns: { label: "Some concerns", badge: "bg-caution-soft text-caution" },
  significant_concerns: { label: "Significant concerns", badge: "bg-severe-soft text-severe" },
};

const SEVERITY_META: Record<string, { label: string; badge: string }> = {
  high: { label: "High", badge: "bg-severe-soft text-severe" },
  medium: { label: "Medium", badge: "bg-caution-soft text-caution" },
  low: { label: "Low", badge: "bg-paper text-ink-soft" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(n: number | null): string {
  return n == null ? "—" : `$${n.toLocaleString()}`;
}

function formatNumber(n: number | null): string {
  return n == null ? "—" : n.toLocaleString();
}

function formatDelta(pct: number | null): string | null {
  if (pct == null) return null;
  const rounded = Math.round(pct);
  if (rounded === 0) return "no change";
  return rounded > 0 ? `up ${rounded}%` : `down ${Math.abs(rounded)}%`;
}

interface ReportEntry {
  result: AnalysisResult;
  created_at: string;
}

export default function ComparisonView({
  earlier,
  later,
}: {
  earlier: ReportEntry;
  later: ReportEntry;
}) {
  const earlierResult = earlier.result;
  const laterResult = later.result;

  const earlierOverall = OVERALL_META[earlierResult.overallAssessment];
  const laterOverall = OVERALL_META[laterResult.overallAssessment];
  const rankDelta =
    ASSESSMENT_RANK[laterResult.overallAssessment] - ASSESSMENT_RANK[earlierResult.overallAssessment];
  const trendLabel = rankDelta < 0 ? "Improved" : rankDelta > 0 ? "Worsened" : "No change";
  const trendClass =
    rankDelta < 0 ? "text-good" : rankDelta > 0 ? "text-severe" : "text-ink-soft";

  const spendDelta = formatDelta(
    percentChange(
      earlierResult.documentSummary.totalSpendNumeric,
      laterResult.documentSummary.totalSpendNumeric,
    ),
  );

  const channelRows = compareChannels(earlierResult, laterResult);
  const kpiRows = compareKpis(earlierResult, laterResult);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="rounded-2xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
          Month-over-month comparison
        </p>
        <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-white">
          {laterResult.documentSummary.businessType ?? "Media Plan Comparison"}
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">
              {formatDate(earlier.created_at)}
            </p>
            <span
              className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${earlierOverall.badge}`}
            >
              {earlierOverall.label}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">
              {formatDate(later.created_at)}
            </p>
            <span
              className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${laterOverall.badge}`}
            >
              {laterOverall.label}
            </span>
          </div>
        </div>

        <p className={`mt-4 text-sm font-medium ${trendClass}`}>
          Overall: {trendLabel}
          {spendDelta && (
            <span className="text-white/70 font-normal"> · Total spend {spendDelta}</span>
          )}
        </p>
      </div>

      {channelRows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-paper-raised">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-ink-soft border-b border-line">
                <th className="py-3 px-4 font-medium">Channel</th>
                <th className="py-3 px-4 font-medium">{formatDate(earlier.created_at)}</th>
                <th className="py-3 px-4 font-medium">{formatDate(later.created_at)}</th>
                <th className="py-3 px-4 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {channelRows.map((row, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="py-3 px-4 font-medium text-ink">
                    {row.channel}
                    {row.status !== "both" && (
                      <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft/70">
                        {row.status === "added" ? "new" : "dropped"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {formatCurrency(row.earlierSpend)}
                    {row.earlierPercent != null ? ` (${row.earlierPercent}%)` : ""}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {formatCurrency(row.laterSpend)}
                    {row.laterPercent != null ? ` (${row.laterPercent}%)` : ""}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {formatDelta(percentChange(row.earlierSpend, row.laterSpend)) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {kpiRows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-paper-raised">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-ink-soft border-b border-line">
                <th className="py-3 px-4 font-medium">KPI</th>
                <th className="py-3 px-4 font-medium">{formatDate(earlier.created_at)}</th>
                <th className="py-3 px-4 font-medium">{formatDate(later.created_at)}</th>
                <th className="py-3 px-4 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {kpiRows.map((row, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="py-3 px-4 font-medium text-ink">
                    {row.label}
                    {row.channel ? ` (${row.channel})` : ""}
                    {row.status !== "both" && (
                      <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft/70">
                        {row.status === "added" ? "new" : "dropped"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {row.earlierDisplay ?? formatNumber(row.earlierValue)}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {row.laterDisplay ?? formatNumber(row.laterValue)}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {formatDelta(percentChange(row.earlierValue, row.laterValue)) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-soft/70">
        Channels and KPIs are matched by name between the two reports, so slightly different
        wording between reports (e.g. &quot;SEM&quot; vs. &quot;Search Ads&quot;) may show as
        separate rows rather than one matched row.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Findings · {formatDate(earlier.created_at)}
          </h2>
          <FindingsColumn result={earlierResult} />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Findings · {formatDate(later.created_at)}
          </h2>
          <FindingsColumn result={laterResult} />
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Recommendations · {formatDate(earlier.created_at)}
          </h2>
          <RecommendationsColumn result={earlierResult} />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Recommendations · {formatDate(later.created_at)}
          </h2>
          <RecommendationsColumn result={laterResult} />
        </div>
      </div>
    </div>
  );
}

function FindingsColumn({ result }: { result: AnalysisResult }) {
  if (result.redFlags.length === 0) {
    return <p className="text-sm text-ink-soft">No red flags identified.</p>;
  }
  return (
    <div className="space-y-3">
      {result.redFlags.map((flag, i) => {
        const meta = SEVERITY_META[flag.severity];
        return (
          <div key={i} className="rounded-lg border border-line bg-paper-raised p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-ink text-sm">{flag.title}</h3>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${meta.badge}`}
              >
                {meta.label}
              </span>
            </div>
            {flag.relatedChannel && (
              <p className="text-xs mt-2 text-ink-soft/70">Channel: {flag.relatedChannel}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RecommendationsColumn({ result }: { result: AnalysisResult }) {
  if (result.recommendations.length === 0) {
    return <p className="text-sm text-ink-soft">No specific recommendations.</p>;
  }
  return (
    <div className="space-y-3">
      {result.recommendations.map((r, i) => (
        <div
          key={i}
          className="rounded-lg border border-line border-l-4 border-l-good bg-paper-raised p-4"
        >
          <h3 className="font-medium text-ink text-sm">{r.title}</h3>
          <p className="text-sm text-ink-soft mt-1.5">{r.recommendation}</p>
          {r.relatedChannel && (
            <p className="text-xs mt-2 text-ink-soft/70">Channel: {r.relatedChannel}</p>
          )}
        </div>
      ))}
    </div>
  );
}
