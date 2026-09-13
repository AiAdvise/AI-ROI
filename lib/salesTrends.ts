import type { SalesDataResult } from "./types";
import { effectiveDate, monthLabel } from "./trends";

export interface SalesPoint {
  id: string;
  created_at: string;
  result: SalesDataResult;
}

export function salesEffectiveDate(s: SalesPoint): string {
  return effectiveDate(s.result.reportingPeriodStart, s.created_at);
}

export function sortSalesByEffectiveDate<T extends SalesPoint>(sales: T[]): T[] {
  return [...sales].sort(
    (a, b) => new Date(salesEffectiveDate(a)).getTime() - new Date(salesEffectiveDate(b)).getTime(),
  );
}

export interface TrendPoint {
  label: string;
  value: number;
}

/** One point per sales snapshot with a stated revenue figure, skipping any that don't. */
export function revenueSeries(sales: SalesPoint[]): TrendPoint[] {
  return sales
    .filter((s) => s.result.totalRevenueNumeric != null)
    .map((s) => ({
      label: monthLabel(salesEffectiveDate(s)),
      value: s.result.totalRevenueNumeric as number,
    }));
}
