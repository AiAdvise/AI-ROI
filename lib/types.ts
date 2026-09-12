import { z } from "zod";

// The model sometimes omits a nullable field entirely instead of setting it
// to null (e.g. dropping "relatedChannel" rather than writing null) - accept
// both and normalize to null so every consumer keeps a plain `string | null`.
const nullableString = z
  .string()
  .nullish()
  .transform((v) => v ?? null);

// The model is asked to also emit a plain numeric value alongside display
// strings like "$1,800" or "12%" so month-over-month deltas can be computed
// without re-parsing prose. It sometimes sends the number as a string
// anyway (or omits it) - coerce either into a clean number or null rather
// than failing validation.
const nullableNumber = z.preprocess((v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}, z.number().nullable());

export const ChannelSpendSchema = z.object({
  channel: z.string(),
  spend: nullableString,
  spendNumeric: nullableNumber,
  percentOfTotal: nullableString,
  percentOfTotalNumeric: nullableNumber,
  notes: nullableString,
});

export const KpiSchema = z.object({
  name: z.string(),
  value: z.string(),
  valueNumeric: nullableNumber,
  channel: nullableString,
});

export const RedFlagSchema = z.object({
  title: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
  relatedChannel: nullableString,
});

export const BenchmarkComparisonSchema = z.object({
  metric: z.string(),
  reportedValue: z.string(),
  benchmarkRange: z.string(),
  assessment: z.enum(["above", "within", "below", "no_benchmark_available", "insufficient_data"]),
  commentary: z.string(),
});

export const AgencyQuestionSchema = z.object({
  question: z.string(),
  whyItMatters: z.string(),
  relatedRedFlag: nullableString,
});

export const RecommendationSchema = z.object({
  title: z.string(),
  recommendation: z.string(),
  reasoning: z.string(),
  relatedChannel: nullableString,
});

export const AnalysisResultSchema = z.object({
  documentSummary: z.object({
    businessType: nullableString,
    reportingPeriod: nullableString,
    totalSpend: nullableString,
    totalSpendNumeric: nullableNumber,
    channelMix: z.array(ChannelSpendSchema).default([]),
    reportedKpis: z.array(KpiSchema).default([]),
  }),
  plainEnglishSummary: z.string(),
  redFlags: z.array(RedFlagSchema).default([]),
  benchmarkComparisons: z.array(BenchmarkComparisonSchema).default([]),
  recommendations: z.array(RecommendationSchema).default([]),
  questionsToAsk: z.array(AgencyQuestionSchema).default([]),
  overallAssessment: z.enum(["looks_reasonable", "some_concerns", "significant_concerns"]),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
