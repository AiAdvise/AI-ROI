import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalysisResultSchema } from "@/lib/types";
import { compareChannels, percentChange } from "@/lib/compare";
import {
  channelSpendSeries,
  computeInsights,
  headlineVerdict,
  monthLabel,
  reportEffectiveDate,
  sortReportsByEffectiveDate,
  type ReportPoint,
} from "@/lib/trends";
import { kpiTotalSeries, costPerLeadSeries } from "@/lib/kpiTrends";
import { computeHealthScore, TONE_HEX } from "@/lib/score";
import StatTile from "@/components/StatTile";
import SpendTrendChart from "@/components/charts/SpendTrendChart";
import AssessmentTimeline from "@/components/charts/AssessmentTimeline";
import ChannelTrendChart from "@/components/charts/ChannelTrendChart";
import CostPerLeadChart from "@/components/charts/CostPerLeadChart";
import MetricBarChart from "@/components/charts/MetricBarChart";
import BrandMark from "@/components/BrandMark";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";

/**
 * Small inline delta badge next to a chart heading (e.g. "+18% since Jun
 * 2026") - pass exactly one of `pct` or `points`. `goodDirection` decides
 * which sign reads as green vs red: "up" for metrics where more is better
 * (health score), "down" for metrics where less is better (cost per lead).
 */
function TrendDelta({
  pct,
  points,
  sinceLabel,
  goodDirection,
}: {
  pct?: number | null;
  points?: number;
  sinceLabel: string;
  goodDirection: "up" | "down";
}) {
  const value = pct ?? points ?? null;
  if (value == null) return null;

  const rounded = Math.round(value);
  if (rounded === 0) {
    return <span className="text-xs font-medium text-ink-soft">No change since {sinceLabel}</span>;
  }

  const isIncrease = rounded > 0;
  const isGood = goodDirection === "up" ? isIncrease : !isIncrease;
  const suffix = pct != null ? "%" : " pts";
  const text = `${isIncrease ? "+" : ""}${rounded}${suffix} since ${sinceLabel}`;

  return (
    <span className={`text-xs font-medium ${isGood ? "text-good" : "text-severe"}`}>{text}</span>
  );
}

const OVERALL_LABEL: Record<string, string> = {
  looks_reasonable: "Looks reasonable",
  some_concerns: "Some concerns",
  significant_concerns: "Significant concerns",
};

const TREND_WINDOW = 6;

export default async function TrendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase.from("reports").select("id, result, created_at");

  const parsedReports: ReportPoint[] = (rows ?? [])
    .map((r) => {
      const parsed = AnalysisResultSchema.safeParse(r.result);
      return parsed.success
        ? { id: r.id as string, created_at: r.created_at as string, result: parsed.data }
        : null;
    })
    .filter((r): r is ReportPoint => r !== null);

  // A report whose document never stated a reporting period has no real
  // position on a month-over-month timeline - defaulting it to "today"
  // would silently misplace it next to reports that do have a real date,
  // so Trends only ever plots reports the model could actually date. (They
  // still show up fine in History, which just needs *some* sortable date.)
  const datedReports = parsedReports.filter(
    (r) => r.result.documentSummary.reportingPeriodStart != null,
  );
  const undatedCount = parsedReports.length - datedReports.length;

  // Sorted by the period each report actually covers, not upload order -
  // otherwise two reports run back-to-back today for different months
  // would show in upload order instead of the order they happened.
  const reports = sortReportsByEffectiveDate(datedReports);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper-raised">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <BrandMark className="text-lg" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/history"
              className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              History
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              New diagnostic
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 py-12">
        <GradientBlobs />
        <h1 className="gradient-text font-serif text-3xl font-semibold tracking-tight mb-2">
          Trends
        </h1>

        {reports.length < 2 ? (
          <p className="text-sm text-ink-soft">
            {parsedReports.length < 2
              ? "Run at least two diagnostics to see trends over time."
              : "None of your saved reports have a clear reporting period stated in the document, so there's nothing to plot on a timeline yet."}{" "}
            <Link href="/" className="underline underline-offset-4 hover:text-ink">
              Run one now.
            </Link>
            {parsedReports.length >= 2 && (
              <>
                {" · "}
                <Link href="/history" className="underline underline-offset-4 hover:text-ink">
                  View your reports
                </Link>
              </>
            )}
          </p>
        ) : (
          <TrendsBody reports={reports} undatedCount={undatedCount} />
        )}
      </main>
    </div>
  );
}

function TrendsBody({ reports, undatedCount }: { reports: ReportPoint[]; undatedCount: number }) {
  // Everything on this page reflects the same window - up to the last
  // TREND_WINDOW saved reports - rather than mixing an all-time chart with
  // a 2-report comparison elsewhere on the same page.
  const windowReports = reports.slice(-TREND_WINDOW);
  const earlier = windowReports[0];
  const later = windowReports[windowReports.length - 1];
  const channelRows = compareChannels(earlier.result, later.result);
  const insights = computeInsights(earlier, later, channelRows);
  const channelSeries = channelSpendSeries(windowReports);

  const spendPoints = windowReports
    .filter((r) => r.result.documentSummary.totalSpendNumeric != null)
    .map((r) => ({
      label: monthLabel(reportEffectiveDate(r)),
      value: r.result.documentSummary.totalSpendNumeric as number,
    }));

  const assessmentPoints = windowReports.map((r) => ({
    label: monthLabel(reportEffectiveDate(r)),
    assessment: r.result.overallAssessment,
  }));

  const healthPoints = windowReports.map((r) => {
    const health = computeHealthScore(r.result);
    return {
      label: monthLabel(reportEffectiveDate(r)),
      value: health.score,
      color: TONE_HEX[health.tone],
      tooltip: `${monthLabel(reportEffectiveDate(r))}: ${health.score}/100 (${health.grade})`,
    };
  });

  // formatValue on the chart abbreviates large numbers ("237k") for axis
  // labels - the hover tooltip shows the exact reported count instead.
  const impressionsPoints = kpiTotalSeries(windowReports, "Impressions").map((p) => ({
    ...p,
    tooltip: `${p.label}: ${p.value.toLocaleString()} impressions`,
  }));
  const clicksPoints = kpiTotalSeries(windowReports, "Clicks").map((p) => ({
    ...p,
    tooltip: `${p.label}: ${p.value.toLocaleString()} clicks`,
  }));
  const cplPoints = costPerLeadSeries(windowReports);

  const spendDeltaPct = percentChange(
    earlier.result.documentSummary.totalSpendNumeric,
    later.result.documentSummary.totalSpendNumeric,
  );

  const redFlagDelta = later.result.redFlags.length - earlier.result.redFlags.length;
  const sinceLabel = `since ${monthLabel(reportEffectiveDate(earlier))}`;
  const headline = headlineVerdict(earlier, later);
  const headlineClasses =
    headline.tone === "good"
      ? "border-good/20 bg-good-soft text-good"
      : headline.tone === "severe"
        ? "border-severe/20 bg-severe-soft text-severe"
        : "border-line bg-paper-raised text-ink";

  return (
    <>
      <Reveal>
        <div
          className={`mb-6 rounded-xl border p-5 font-serif text-lg font-semibold leading-snug shadow-sm ${headlineClasses}`}
        >
          {headline.text}
        </div>
      </Reveal>

      <p className="text-sm text-ink-soft mb-8">
        Showing your last {windowReports.length} report{windowReports.length === 1 ? "" : "s"}:{" "}
        {monthLabel(reportEffectiveDate(earlier))} to {monthLabel(reportEffectiveDate(later))}
        {reports.length > windowReports.length &&
          ` (${reports.length - windowReports.length} earlier report${
            reports.length - windowReports.length === 1 ? "" : "s"
          } not shown)`}
        .{" "}
        <Link
          href={`/compare?a=${earlier.id}&b=${later.id}`}
          className="underline underline-offset-4 hover:text-ink"
        >
          View full comparison
        </Link>
        {" · "}
        <Link href="/history" className="underline underline-offset-4 hover:text-ink">
          Compare a different pair
        </Link>
      </p>

      {undatedCount > 0 && (
        <p className="text-xs text-ink-soft/70 -mt-6 mb-8">
          {undatedCount} report{undatedCount === 1 ? "" : "s"} without a clear reporting period
          stated in the document {undatedCount === 1 ? "isn't" : "aren't"} shown here.{" "}
          <Link href="/history" className="underline underline-offset-4 hover:text-ink">
            View in History
          </Link>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Reveal delay={0}>
          <StatTile
            accent="a"
            label="Latest total spend"
            value={
              later.result.documentSummary.totalSpendNumeric != null
                ? `$${later.result.documentSummary.totalSpendNumeric.toLocaleString()}`
                : "—"
            }
            delta={
              spendDeltaPct != null
                ? `${spendDeltaPct >= 0 ? "+" : ""}${Math.round(spendDeltaPct)}% ${sinceLabel}`
                : null
            }
          />
        </Reveal>
        <Reveal delay={80}>
          <StatTile
            accent="c"
            label="Latest overall assessment"
            value={OVERALL_LABEL[later.result.overallAssessment]}
          />
        </Reveal>
        <Reveal delay={160}>
          <StatTile
            accent="b"
            label="Red flags"
            value={String(later.result.redFlags.length)}
            delta={
              redFlagDelta === 0
                ? `No change ${sinceLabel}`
                : `${redFlagDelta > 0 ? "+" : ""}${redFlagDelta} ${sinceLabel}`
            }
            deltaTone={redFlagDelta > 0 ? "severe" : redFlagDelta < 0 ? "good" : "neutral"}
          />
        </Reveal>
      </div>

      {insights.length > 0 && (
        <Reveal className="mb-10">
          <div className="rounded-xl border border-accent/20 bg-accent-soft p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              What changed
            </h2>
            <ul className="space-y-1.5">
              {insights.map((insight, i) => (
                <li key={i} className="text-sm text-ink flex gap-2">
                  <span className="text-accent">&bull;</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      {spendPoints.length >= 2 && (
        <Reveal className="mb-10">
          <h2 className="font-serif text-lg font-semibold text-ink mb-1">Total spend over time</h2>
          <p className="text-xs text-ink-soft/70 mb-3">Total reported ad spend for each period.</p>
          <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
            <SpendTrendChart points={spendPoints} />
          </div>
        </Reveal>
      )}

      {cplPoints.length >= 2 && (
        <Reveal className="mb-10">
          <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
            <h2 className="font-serif text-lg font-semibold text-ink">Cost per lead over time</h2>
            <TrendDelta
              pct={percentChange(cplPoints[0].value, cplPoints[cplPoints.length - 1].value)}
              sinceLabel={cplPoints[0].label}
              goodDirection="down"
            />
          </div>
          <p className="text-xs text-ink-soft/70 mb-3">
            Total spend divided by calls + form fills - lower is better.
          </p>
          <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
            <CostPerLeadChart points={cplPoints} />
          </div>
        </Reveal>
      )}

      {healthPoints.length >= 2 && (
        <Reveal className="mb-10">
          <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
            <h2 className="font-serif text-lg font-semibold text-ink">Health score over time</h2>
            <TrendDelta
              pct={null}
              points={healthPoints[healthPoints.length - 1].value - healthPoints[0].value}
              sinceLabel={healthPoints[0].label}
              goodDirection="up"
            />
          </div>
          <p className="text-xs text-ink-soft/70 mb-3">
            0-100, deducted from each report&apos;s own red flags (high -22, medium -10, low -4
            points) - the same score shown at the top of each individual report. A quick trend
            signal, not a replacement for reading the findings themselves.
          </p>
          <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
            <MetricBarChart
              points={healthPoints}
              color={TONE_HEX.good}
              format="integer"
              ariaLabel="Health score over time"
              width={640}
            />
          </div>
        </Reveal>
      )}

      <Reveal className="mb-10">
        <h2 className="font-serif text-lg font-semibold text-ink mb-1">
          Overall assessment over time
        </h2>
        <p className="text-xs text-ink-soft/70 mb-3">
          The AI&apos;s overall read on each report, independent of the health score above.
        </p>
        <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
          <AssessmentTimeline points={assessmentPoints} />
        </div>
      </Reveal>

      {(impressionsPoints.length >= 2 || clicksPoints.length >= 2) && (
        <Reveal className="mb-10">
          <h2 className="font-serif text-lg font-semibold text-ink mb-1">Reach &amp; clicks over time</h2>
          <p className="text-xs text-ink-soft/70 mb-3">
            How many people saw (impressions) and engaged with (clicks) your ads, totaled across
            all channels each period. Hover a bar for the exact number.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {impressionsPoints.length >= 2 && (
              <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-2">
                  Impressions
                </p>
                <MetricBarChart
                  points={impressionsPoints}
                  color="#1f5f9e"
                  format="compact"
                  ariaLabel="Impressions over time"
                />
              </div>
            )}
            {clicksPoints.length >= 2 && (
              <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-2">
                  Clicks
                </p>
                <MetricBarChart
                  points={clicksPoints}
                  color="#a0266b"
                  format="integer"
                  ariaLabel="Clicks over time"
                />
              </div>
            )}
          </div>
        </Reveal>
      )}

      {channelSeries.length > 0 && (
        <Reveal className="mb-10">
          <h2 className="font-serif text-lg font-semibold text-ink mb-1">Channel spend over time</h2>
          <p className="text-xs text-ink-soft/70 mb-3">
            How your budget has been split across channels each period.
          </p>
          <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
            <ChannelTrendChart series={channelSeries} />
          </div>
        </Reveal>
      )}
    </>
  );
}
