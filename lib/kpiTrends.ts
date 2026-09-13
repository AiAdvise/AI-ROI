import { monthLabel, reportEffectiveDate, type ReportPoint } from "./trends";

function kpiTotalForReport(report: ReportPoint, kpiName: string): number | null {
  const matches = report.result.documentSummary.reportedKpis.filter(
    (k) => k.name.trim().toLowerCase() === kpiName.trim().toLowerCase() && k.valueNumeric != null,
  );
  if (matches.length === 0) return null;
  return matches.reduce((sum, k) => sum + (k.valueNumeric as number), 0);
}

export interface TrendPoint {
  label: string;
  value: number;
}

/**
 * Totals one canonical KPI (e.g. "Impressions") across all channels within
 * each report, one point per report period. Reports that never mention this
 * KPI are skipped rather than plotted as zero - a report simply not
 * reporting Impressions isn't the same as Impressions being zero.
 */
export function kpiTotalSeries(reports: ReportPoint[], kpiName: string): TrendPoint[] {
  return reports
    .map((r) => {
      const value = kpiTotalForReport(r, kpiName);
      return value == null ? null : { label: monthLabel(reportEffectiveDate(r)), value };
    })
    .filter((p): p is TrendPoint => p !== null);
}

/**
 * Blended cost-per-lead per report: total spend divided by the two
 * unambiguous direct-response actions the framework's canonical KPI names
 * cover (Calls + Form Fills). Site Visits/Household Visits are attribution
 * signals, not confirmed contacts, so they're deliberately excluded - this
 * stays a "cost per actual contact" figure, not a cost-per-click dressed up.
 * Skips any report missing spend or reporting zero leads, rather than
 * showing a misleading divide-by-zero or an unpriced point.
 */
export function costPerLeadSeries(reports: ReportPoint[]): TrendPoint[] {
  return reports
    .map((r) => {
      const spend = r.result.documentSummary.totalSpendNumeric;
      const calls = kpiTotalForReport(r, "Calls") ?? 0;
      const formFills = kpiTotalForReport(r, "Form Fills") ?? 0;
      const leads = calls + formFills;
      if (spend == null || leads <= 0) return null;
      return { label: monthLabel(reportEffectiveDate(r)), value: spend / leads };
    })
    .filter((p): p is TrendPoint => p !== null);
}
