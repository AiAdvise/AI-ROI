import type { AnalysisResult } from "./types";

export type FunnelStage = "upper" | "mid" | "lower" | "unknown";

// Mirrors DIAGNOSTIC_FRAMEWORK Section 4's own funnel model (lib/framework.ts)
// - this is a visualization of a classification the framework already makes
// in prose, not a new judgment call. Matched against the canonical channel
// names the model is instructed to use (see lib/anthropic.ts), so this stays
// in sync with the model's own output as long as both lists agree.
const STAGE_BY_CHANNEL: Record<string, FunnelStage> = {
  "ctv/ott": "upper",
  "pre-roll/olv": "upper",
  youtube: "upper",
  dooh: "upper",
  social: "mid",
  display: "mid",
  "search ads (sem)": "lower",
  "performance max (pmax)": "lower",
  "local services ads (lsa)": "lower",
};

export function classifyChannel(channel: string): FunnelStage {
  return STAGE_BY_CHANNEL[channel.trim().toLowerCase()] ?? "unknown";
}

export interface FunnelBreakdown {
  upper: number;
  mid: number;
  lower: number;
  unknown: number;
  byWeight: "spend" | "channel count";
}

/**
 * Splits the channel mix into funnel stages, weighted by spend when at
 * least two channels report a spend number and by a simple channel count
 * otherwise (most agency reports don't break spend out per channel - see
 * the real report evidence in framework.ts's own commentary). Percentages
 * sum to ~100 (rounding aside).
 */
export function funnelBreakdown(result: AnalysisResult): FunnelBreakdown | null {
  const channels = result.documentSummary.channelMix;
  if (channels.length === 0) return null;

  const withSpend = channels.filter((c) => c.spendNumeric != null);
  const byWeight: FunnelBreakdown["byWeight"] = withSpend.length >= 2 ? "spend" : "channel count";

  const totals: Record<FunnelStage, number> = { upper: 0, mid: 0, lower: 0, unknown: 0 };
  let total = 0;

  for (const c of channels) {
    const stage = classifyChannel(c.channel);
    const weight = byWeight === "spend" ? (c.spendNumeric ?? 0) : 1;
    totals[stage] += weight;
    total += weight;
  }

  if (total === 0) return null;

  return {
    upper: (totals.upper / total) * 100,
    mid: (totals.mid / total) * 100,
    lower: (totals.lower / total) * 100,
    unknown: (totals.unknown / total) * 100,
    byWeight,
  };
}
