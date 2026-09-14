import Link from "next/link";
import { percentChange } from "@/lib/compare";
import { monthLabel, reportEffectiveDate, type ReportPoint } from "@/lib/trends";
import { revenueSeries, salesEffectiveDate, type SalesPoint } from "@/lib/salesTrends";
import StatTile from "@/components/StatTile";
import SpendTrendChart from "@/components/charts/SpendTrendChart";
import Reveal from "@/components/Reveal";

const TREND_WINDOW = 6;

export default function SalesTrendsSection({
  sales,
  adReports,
  className,
}: {
  sales: SalesPoint[];
  adReports: ReportPoint[];
  className?: string;
}) {
  const windowSales = sales.slice(-TREND_WINDOW);
  const earlier = windowSales[0];
  const later = windowSales[windowSales.length - 1];
  const revPoints = revenueSeries(windowSales);

  const revDeltaPct = percentChange(
    earlier.result.totalRevenueNumeric,
    later.result.totalRevenueNumeric,
  );
  const sinceLabel = `since ${monthLabel(salesEffectiveDate(earlier))}`;

  // Independent window over the ad-report side, matching TrendsBody's own
  // windowing - the two collections aren't guaranteed to share periods, so
  // this is a side-by-side visual comparison, not a merged/aligned chart.
  const adWindow = adReports.slice(-TREND_WINDOW);
  const spendPoints = adWindow
    .filter((r) => r.result.documentSummary.totalSpendNumeric != null)
    .map((r) => ({
      label: monthLabel(reportEffectiveDate(r)),
      value: r.result.documentSummary.totalSpendNumeric as number,
    }));

  // Month-over-month, not window-start-vs-end: the two most recent sales
  // snapshots specifically - "how many new sales this month" means versus
  // last month, not versus however far back the window happens to start.
  const prevSales = windowSales.length >= 2 ? windowSales[windowSales.length - 2] : null;
  const dealCountDelta =
    prevSales?.result.dealCountNumeric != null && later.result.dealCountNumeric != null
      ? later.result.dealCountNumeric - prevSales.result.dealCountNumeric
      : null;
  const revenueDeltaDollar =
    prevSales?.result.totalRevenueNumeric != null && later.result.totalRevenueNumeric != null
      ? later.result.totalRevenueNumeric - prevSales.result.totalRevenueNumeric
      : null;

  // Same month-over-month treatment on the ad side, so the attribution
  // callout can compare "spend change" against "new sales" over the same
  // two most recent periods, not the whole window.
  const prevAdReport = adWindow.length >= 2 ? adWindow[adWindow.length - 2] : null;
  const latestAdReport = adWindow.length >= 1 ? adWindow[adWindow.length - 1] : null;
  const adSpendDeltaPct =
    prevAdReport && latestAdReport
      ? percentChange(
          prevAdReport.result.documentSummary.totalSpendNumeric,
          latestAdReport.result.documentSummary.totalSpendNumeric,
        )
      : null;

  // A plain-English "what changed since last month" sentence, built only
  // from the deltas above - never a separate model call, same pattern as
  // headlineVerdict/computeInsights on the main Trends page.
  let deltaSentence: string | null = null;
  if (prevSales && (dealCountDelta != null || revenueDeltaDollar != null)) {
    const prevLabel = monthLabel(salesEffectiveDate(prevSales));
    const parts: string[] = [];
    if (dealCountDelta != null) {
      const sign = dealCountDelta >= 0 ? "+" : "";
      parts.push(`${sign}${dealCountDelta} ${Math.abs(dealCountDelta) === 1 ? "sale" : "sales"}`);
    }
    if (revenueDeltaDollar != null) {
      const direction = revenueDeltaDollar >= 0 ? "up" : "down";
      parts.push(`${direction} $${Math.abs(revenueDeltaDollar).toLocaleString()} in revenue`);
    }
    deltaSentence = `Compared to ${prevLabel}, you closed ${parts.join(" - ")}.`;
    if (adSpendDeltaPct != null) {
      const spendDirection = adSpendDeltaPct >= 0 ? "increased" : "decreased";
      deltaSentence += ` Ad spend ${spendDirection} ${Math.round(Math.abs(adSpendDeltaPct))}% over the same two months - the more these move together, the stronger the case the advertising is driving it.`;
    }
  }

  return (
    <div className={className}>
      <h2 className="gradient-text font-serif text-2xl font-semibold tracking-tight mb-2">Sales</h2>
      <p className="text-sm text-ink-soft mb-8">
        From your last {windowSales.length} sales snapshot{windowSales.length === 1 ? "" : "s"}:{" "}
        {monthLabel(salesEffectiveDate(earlier))} to {monthLabel(salesEffectiveDate(later))}.{" "}
        <Link href="/history" className="underline underline-offset-4 hover:text-ink">
          View sales history
        </Link>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Reveal delay={0}>
          <StatTile
            accent="a"
            label="Latest revenue"
            value={later.result.totalRevenue ?? "—"}
            delta={
              revDeltaPct != null
                ? `${revDeltaPct >= 0 ? "+" : ""}${Math.round(revDeltaPct)}% ${sinceLabel}`
                : null
            }
            deltaTone={revDeltaPct != null ? (revDeltaPct >= 0 ? "good" : "severe") : "neutral"}
          />
        </Reveal>
        <Reveal delay={80}>
          <StatTile accent="b" label="Latest sales / jobs" value={later.result.dealCount ?? "—"} />
        </Reveal>
        <Reveal delay={160}>
          <StatTile accent="c" label="Latest average sale" value={later.result.avgDealSize ?? "—"} />
        </Reveal>
      </div>

      {revPoints.length >= 2 && (
        <Reveal className="mb-10">
          <h3 className="font-serif text-lg font-semibold text-ink mb-1">Revenue over time</h3>
          <p className="text-xs text-ink-soft/70 mb-3">
            Total revenue reported in each sales snapshot.
          </p>
          <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
            <SpendTrendChart points={revPoints} color="#0891b2" ariaLabel="Revenue over time" />
          </div>
        </Reveal>
      )}

      {revPoints.length >= 2 && spendPoints.length >= 2 && (
        <Reveal className="mb-10">
          <h3 className="font-serif text-lg font-semibold text-ink mb-1">Ad spend vs. revenue</h3>
          <p className="text-xs text-ink-soft/70 mb-3">
            Placed side by side so you can compare trend direction, not exact scale - spend and
            revenue are usually very different magnitudes, and these two charts may not cover
            exactly the same periods.
          </p>
          {deltaSentence && (
            <div className="mb-4 rounded-xl border border-good/20 bg-good-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-good mb-1">
                New business this month
              </p>
              <p className="text-sm text-ink leading-relaxed">{deltaSentence}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-2">
                Ad spend
              </p>
              <SpendTrendChart points={spendPoints} ariaLabel="Ad spend over time" />
            </div>
            <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-2">
                Revenue
              </p>
              <SpendTrendChart points={revPoints} color="#0891b2" ariaLabel="Revenue over time" />
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
