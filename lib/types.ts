import { z } from "zod";

// The model sometimes omits a nullable field entirely instead of setting it
// to null (e.g. dropping "relatedChannel" rather than writing null) - accept
// both and normalize to null so every consumer keeps a plain `string | null`.
const nullableString = z
  .string()
  .nullish()
  .transform((v) => v ?? null);

export const ChannelSpendSchema = z.object({
  channel: z.string(),
  spend: nullableString,
  percentOfTotal: nullableString,
  notes: nullableString,
});

export const KpiSchema = z.object({
  name: z.string(),
  value: z.string(),
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
