import type { AnalysisResult } from "./types";

// Same validated categorical order used throughout the app (trend charts,
// the channel-spend donut) - kept in one place so a channel's color means
// the same thing everywhere it appears on a given report.
export const CHANNEL_COLORS = ["#b3541e", "#1f5f9e", "#a0266b", "#0891b2", "#5b3fa0"];
export const OTHER_CHANNEL_COLOR = "#8a8478";

/**
 * One color per channel for a single report, ranked by spend (matching the
 * donut chart's own ranking) when at least two channels report a spend
 * number, falling back to document order otherwise so a color assignment
 * still exists even when the report never breaks out spend per channel.
 */
export function channelColorMap(
  channelMix: AnalysisResult["documentSummary"]["channelMix"],
): Map<string, string> {
  const withSpend = channelMix.filter((c) => c.spendNumeric != null && c.spendNumeric > 0);
  const ranked =
    withSpend.length >= 2
      ? [...channelMix].sort((a, b) => (b.spendNumeric ?? -1) - (a.spendNumeric ?? -1))
      : channelMix;

  const map = new Map<string, string>();
  ranked.forEach((c) => {
    const key = c.channel.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, map.size < CHANNEL_COLORS.length ? CHANNEL_COLORS[map.size] : OTHER_CHANNEL_COLOR);
    }
  });
  return map;
}

export function colorForChannel(map: Map<string, string>, channel: string | null): string {
  if (!channel) return OTHER_CHANNEL_COLOR;
  return map.get(channel.trim().toLowerCase()) ?? OTHER_CHANNEL_COLOR;
}
