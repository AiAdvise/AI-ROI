import { z } from "zod";

export const ChannelSpendSchema = z.object({
  channel: z.string(),
  spend: z.string().nullable(),
  percentOfTotal: z.string().nullable(),
  notes: z.string().nullable(),
});

export const KpiSchema = z.object({
  name: z.string(),
  value: z.string(),
  channel: z.string().nullable(),
});

export const RedFlagSchema = z.object({
  title: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
  relatedChannel: z.string().nullable(),
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
  relatedRedFlag: z.string().nullable(),
});

export const RecommendationSchema = z.object({
  title: z.string(),
  recommendation: z.string(),
  reasoning: z.string(),
  relatedChannel: z.string().nullable(),
});

export const AnalysisResultSchema = z.object({
  documentSummary: z.object({
    businessType: z.string().nullable(),
    reportingPeriod: z.string().nullable(),
    totalSpend: z.string().nullable(),
    channelMix: z.array(ChannelSpendSchema),
    reportedKpis: z.array(KpiSchema),
  }),
  plainEnglishSummary: z.string(),
  redFlags: z.array(RedFlagSchema),
  benchmarkComparisons: z.array(BenchmarkComparisonSchema),
  recommendations: z.array(RecommendationSchema),
  questionsToAsk: z.array(AgencyQuestionSchema),
  overallAssessment: z.enum(["looks_reasonable", "some_concerns", "significant_concerns"]),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
