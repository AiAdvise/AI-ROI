import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalysisResultSchema } from "@/lib/types";
import { compareChannels, percentChange } from "@/lib/compare";
import { channelSpendSeries, computeInsights, type ReportPoint } from "@/lib/trends";
import StatTile from "@/components/StatTile";
import SpendTrendChart from "@/components/charts/SpendTrendChart";
import AssessmentTimeline from "@/components/charts/AssessmentTimeline";
import ChannelTrendChart from "@/components/charts/ChannelTrendChart";

const OVERALL_LABEL: Record<string, string> = {
  looks_reasonable: "Looks reasonable",
  some_concerns: "Some concerns",
  significant_concerns: "Significant concerns",
};

const TREND_WINDOW = 6;

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function TrendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("reports")
    .select("id, result, created_at")
    .order("created_at", { ascending: true });

  const reports: ReportPoint[] = (rows ?? [])
    .map((r) => {
      const parsed = AnalysisResultSchema.safeParse(r.result);
      return parsed.success
        ? { id: r.id as string, created_at: r.created_at as string, result: parsed.data }
        : null;
    })
    .filter((r): r is ReportPoint => r !== null);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper-raised">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-semibold tracking-tight text-ink">
            Media Plan Diagnostic
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

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink mb-2">Trends</h1>

        {reports.length < 2 ? (
          <p className="text-sm text-ink-soft">
            Run at least two diagnostics to see trends over time.{" "}
            <Link href="/" className="underline underline-offset-4 hover:text-ink">
              Run one now.
            </Link>
          </p>
        ) : (
          <TrendsBody reports={reports} />
        )}
      </main>
    </div>
  );
}

function TrendsBody({ reports }: { reports: ReportPoint[] }) {
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
      label: shortDate(r.created_at),
      value: r.result.documentSummary.totalSpendNumeric as number,
    }));

  const assessmentPoints = windowReports.map((r) => ({
    label: shortDate(r.created_at),
    assessment: r.result.overallAssessment,
  }));

  const spendDeltaPct = percentChange(
    earlier.result.documentSummary.totalSpendNumeric,
    later.result.documentSummary.totalSpendNumeric,
  );

  const redFlagDelta = later.result.redFlags.length - earlier.result.redFlags.length;
  const sinceLabel = `since ${shortDate(earlier.created_at)}`;

  return (
    <>
      <p className="text-sm text-ink-soft mb-8">
        Showing your last {windowReports.length} report{windowReports.length === 1 ? "" : "s"}:{" "}
        {fullDate(earlier.created_at)} to {fullDate(later.created_at)}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatTile
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
        <StatTile
          label="Latest overall assessment"
          value={OVERALL_LABEL[later.result.overallAssessment]}
        />
        <StatTile
          label="Red flags"
          value={String(later.result.redFlags.length)}
          delta={
            redFlagDelta === 0
              ? `No change ${sinceLabel}`
              : `${redFlagDelta > 0 ? "+" : ""}${redFlagDelta} ${sinceLabel}`
          }
          deltaTone={redFlagDelta > 0 ? "severe" : redFlagDelta < 0 ? "good" : "neutral"}
        />
      </div>

      {insights.length > 0 && (
        <div className="mb-10 rounded-xl border border-accent/20 bg-accent-soft p-5">
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
      )}

      {spendPoints.length >= 2 && (
        <div className="mb-10">
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">Total spend over time</h2>
          <div className="rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
            <SpendTrendChart points={spendPoints} />
          </div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="font-serif text-lg font-semibold text-ink mb-3">
          Overall assessment over time
        </h2>
        <div className="rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
          <AssessmentTimeline points={assessmentPoints} />
        </div>
      </div>

      {channelSeries.length > 0 && (
        <div className="mb-10">
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">Channel spend over time</h2>
          <div className="rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
            <ChannelTrendChart series={channelSeries} />
          </div>
        </div>
      )}
    </>
  );
}
