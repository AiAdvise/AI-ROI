import type { AnalysisResult } from "./types";

export interface ChannelComparisonRow {
  channel: string;
  earlierSpend: number | null;
  laterSpend: number | null;
  earlierPercent: number | null;
  laterPercent: number | null;
  status: "both" | "added" | "dropped";
}

export interface KpiComparisonRow {
  label: string;
  channel: string | null;
  earlierValue: number | null;
  earlierDisplay: string | null;
  laterValue: number | null;
  laterDisplay: string | null;
  status: "both" | "added" | "dropped";
}

export const ASSESSMENT_RANK: Record<string, number> = {
  looks_reasonable: 0,
  some_concerns: 1,
  significant_concerns: 2,
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function compareChannels(
  earlier: AnalysisResult,
  later: AnalysisResult,
): ChannelComparisonRow[] {
  const earlierMap = new Map(
    earlier.documentSummary.channelMix.map((c) => [normalize(c.channel), c]),
  );
  const laterMap = new Map(
    later.documentSummary.channelMix.map((c) => [normalize(c.channel), c]),
  );
  const allKeys = new Set([...earlierMap.keys(), ...laterMap.keys()]);

  return Array.from(allKeys)
    .map((key) => {
      const e = earlierMap.get(key);
      const l = laterMap.get(key);
      return {
        channel: (l ?? e)!.channel,
        earlierSpend: e?.spendNumeric ?? null,
        laterSpend: l?.spendNumeric ?? null,
        earlierPercent: e?.percentOfTotalNumeric ?? null,
        laterPercent: l?.percentOfTotalNumeric ?? null,
        status: (e && l ? "both" : e ? "dropped" : "added") as ChannelComparisonRow["status"],
      };
    })
    .sort((a, b) => a.channel.localeCompare(b.channel));
}

export function compareKpis(earlier: AnalysisResult, later: AnalysisResult): KpiComparisonRow[] {
  function keyFor(k: { name: string; channel: string | null }) {
    return `${k.channel ? normalize(k.channel) : ""}::${normalize(k.name)}`;
  }

  const earlierMap = new Map(earlier.documentSummary.reportedKpis.map((k) => [keyFor(k), k]));
  const laterMap = new Map(later.documentSummary.reportedKpis.map((k) => [keyFor(k), k]));
  const allKeys = new Set([...earlierMap.keys(), ...laterMap.keys()]);

  return Array.from(allKeys)
    .map((key) => {
      const e = earlierMap.get(key);
      const l = laterMap.get(key);
      const ref = (l ?? e)!;
      return {
        label: ref.name,
        channel: ref.channel,
        earlierValue: e?.valueNumeric ?? null,
        earlierDisplay: e?.value ?? null,
        laterValue: l?.valueNumeric ?? null,
        laterDisplay: l?.value ?? null,
        status: (e && l ? "both" : e ? "dropped" : "added") as KpiComparisonRow["status"],
      };
    })
    .sort(
      (a, b) => (a.channel ?? "").localeCompare(b.channel ?? "") || a.label.localeCompare(b.label),
    );
}

export function percentChange(before: number | null, after: number | null): number | null {
  if (before == null || after == null || before === 0) return null;
  return ((after - before) / before) * 100;
}
