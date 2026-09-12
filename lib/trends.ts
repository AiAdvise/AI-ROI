import type { AnalysisResult } from "./types";
import { ASSESSMENT_RANK, type ChannelComparisonRow, percentChange } from "./compare";

export interface ReportPoint {
  id: string;
  created_at: string;
  result: AnalysisResult;
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
