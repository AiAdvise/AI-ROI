import type { AnalysisResult } from "./types";
import { ASSESSMENT_RANK, type ChannelComparisonRow, percentChange } from "./compare";

export interface ReportPoint {
  id: string;
  created_at: string;
  result: AnalysisResult;
}

/**
 * The date a report should be sorted and labeled by: the reporting period
 * the document itself states (extracted by the model), not the day it
 * happened to be uploaded. Falls back to the upload date only when the
 * document didn't state a period - two reports both run today, for two
 * different months, should never both read as "today".
 */
export function effectiveDate(periodStart: string | null, createdAt: string): string {
  return periodStart ?? createdAt;
}

export function reportEffectiveDate(report: ReportPoint): string {
  return effectiveDate(report.result.documentSummary.reportingPeriodStart, report.created_at);
}

export function sortReportsByEffectiveDate<T extends ReportPoint>(reports: T[]): T[] {
  return [...reports].sort(
    (a, b) => new Date(reportEffectiveDate(a)).getTime() - new Date(reportEffectiveDate(b)).getTime(),
  );
}

/** "Aug 2026" - reports are grouped and labeled by month, not by day. */
export function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const OVERALL_LABEL: Record<string, string> = {
  looks_reasonable: "looks reasonable",
  some_concerns: "some concerns",
  significant_concerns: "significant concerns",
};

function pctLabel(pct: number): string {
  const rounded = Math.round(Math.abs(pct));
  return `${rounded}%`;
}

// Fixed categorical order, validated for CVD-safe adjacent separation and a
// normal-vision floor (see the dataviz skill's palette validator) - never
// generate a color per channel, and never reuse the good/caution/severe
// status colors here, since those are reserved for assessment state.
const CHANNEL_COLORS = ["#b3541e", "#1f5f9e", "#a0266b", "#0891b2", "#5b3fa0"];
const MAX_CHANNEL_SERIES = CHANNEL_COLORS.length;

export interface ChannelSeries {
  channel: string;
  color: string;
  points: { label: string; value: number | null }[];
}

/**
 * Pivots each report's channel spend into one series per channel across the
 * whole window, so a channel's trend reads as a single line rather than a
 * single before/after pair. Channels are matched by normalized name, same as
 * the pairwise comparison in lib/compare.ts. Beyond MAX_CHANNEL_SERIES
 * channels (ranked by total spend across the window), the smallest ones are
 * folded into "Other" rather than generating more hues.
 */
export function channelSpendSeries(reports: ReportPoint[]): ChannelSeries[] {
  const labels = reports.map((r) => monthLabel(reportEffectiveDate(r)));
  const totalsByChannel = new Map<string, { display: string; total: number; values: (number | null)[] }>();

  reports.forEach((r, i) => {
    r.result.documentSummary.channelMix.forEach((c) => {
      const key = c.channel.trim().toLowerCase();
      if (!totalsByChannel.has(key)) {
        totalsByChannel.set(key, {
          display: c.channel,
          total: 0,
          values: new Array(reports.length).fill(null),
        });
      }
      const entry = totalsByChannel.get(key)!;
      if (c.spendNumeric != null) {
        entry.values[i] = c.spendNumeric;
        entry.total += c.spendNumeric;
      }
    });
  });

  const ranked = Array.from(totalsByChannel.values()).sort((a, b) => b.total - a.total);
  const top = ranked.slice(0, MAX_CHANNEL_SERIES);
  const rest = ranked.slice(MAX_CHANNEL_SERIES);

  const series: ChannelSeries[] = top.map((entry, i) => ({
    channel: entry.display,
    color: CHANNEL_COLORS[i],
    points: entry.values.map((value, i2) => ({ label: labels[i2], value })),
  }));

  if (rest.length > 0) {
    const otherValues = new Array(reports.length).fill(null) as (number | null)[];
    rest.forEach((entry) => {
      entry.values.forEach((v, i) => {
        if (v != null) {
          otherValues[i] = (otherValues[i] ?? 0) + v;
        }
      });
    });
    series.push({
      channel: "Other",
      color: "#8a8478",
      points: otherValues.map((value, i) => ({ label: labels[i], value })),
    });
  }

  return series;
}

/**
 * Short, grounded callouts built only from real deltas already computed
 * elsewhere (assessment rank, spend %, red-flag counts, channel movers) -
 * never a separate model call, so there's nothing here that isn't a direct
 * readout of the two reports being compared.
 */
export function computeInsights(
  earlier: ReportPoint,
  later: ReportPoint,
  channelRows: ChannelComparisonRow[],
): string[] {
  const insights: string[] = [];

  const rankDelta =
    ASSESSMENT_RANK[later.result.overallAssessment] - ASSESSMENT_RANK[earlier.result.overallAssessment];
  if (rankDelta < 0) {
    insights.push(
      `Overall assessment improved from ${OVERALL_LABEL[earlier.result.overallAssessment]} to ${OVERALL_LABEL[later.result.overallAssessment]}.`,
    );
  } else if (rankDelta > 0) {
    insights.push(
      `Overall assessment worsened from ${OVERALL_LABEL[earlier.result.overallAssessment]} to ${OVERALL_LABEL[later.result.overallAssessment]} - worth a closer look.`,
    );
  }

  const spendPct = percentChange(
    earlier.result.documentSummary.totalSpendNumeric,
    later.result.documentSummary.totalSpendNumeric,
  );
  if (spendPct != null) {
    insights.push(
      `Total spend ${spendPct >= 0 ? "increased" : "decreased"} ${pctLabel(spendPct)} between these two reports.`,
    );
  }

  const earlierFlags = earlier.result.redFlags.length;
  const laterFlags = later.result.redFlags.length;
  if (laterFlags > earlierFlags) {
    insights.push(`Red flags increased from ${earlierFlags} to ${laterFlags}.`);
  } else if (laterFlags < earlierFlags) {
    insights.push(`Red flags decreased from ${earlierFlags} to ${laterFlags} - improvement.`);
  }

  const movers = channelRows
    .filter((r) => r.status === "both" && r.earlierSpend != null && r.laterSpend != null)
    .map((r) => ({ row: r, pct: percentChange(r.earlierSpend, r.laterSpend) }))
    .filter((m): m is { row: ChannelComparisonRow; pct: number } => m.pct != null)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

  if (movers.length > 0) {
    const top = movers[0];
    insights.push(
      `${top.row.channel} spend moved the most: ${top.pct >= 0 ? "up" : "down"} ${pctLabel(top.pct)}.`,
    );
  }

  const added = channelRows.filter((r) => r.status === "added");
  const dropped = channelRows.filter((r) => r.status === "dropped");
  if (added.length > 0) {
    insights.push(
      `${added.map((r) => r.channel).join(", ")} ${added.length > 1 ? "are" : "is"} new in the latest report.`,
    );
  } else if (dropped.length > 0) {
    insights.push(
      `${dropped.map((r) => r.channel).join(", ")} ${dropped.length > 1 ? "no longer appear" : "no longer appears"} in the latest report.`,
    );
  }

  return insights.slice(0, 4);
}
