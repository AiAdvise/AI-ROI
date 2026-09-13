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

// The model is asked to normalize whatever reporting period the document
// states (e.g. "August 2026 Performance Report", "8/1/26 - 8/31/26") into
// the ISO date of that period's first day, so reports can be sorted and
// labeled by the month they actually cover instead of the day they happened
// to be uploaded. Only accept it if it actually parses as a date.
const nullableDateString = z.preprocess((v) => {
  if (typeof v !== "string" || v.trim() === "") return null;
  return Number.isNaN(new Date(v).getTime()) ? null : v;
}, z.string().nullable());

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

// Distinct from RecommendationSchema: a recommendation is a media-buying
// tactic change for the agency to make, an action item is something the
// business owner can do themselves (their own website, tracking, CRM)
// independent of the agency.
export const ActionItemSchema = z.object({
  title: z.string(),
  action: z.string(),
  reasoning: z.string(),
  relatedChannel: nullableString,
});

export const AnalysisResultSchema = z.object({
  documentSummary: z.object({
    businessType: nullableString,
    reportingPeriod: nullableString,
    reportingPeriodStart: nullableDateString,
    totalSpend: nullableString,
    totalSpendNumeric: nullableNumber,
    channelMix: z.array(ChannelSpendSchema).default([]),
    reportedKpis: z.array(KpiSchema).default([]),
  }),
  plainEnglishSummary: z.string(),
  // Optional/defaulted so reports saved before this field existed keep
  // parsing fine (they just fall back to plainEnglishSummary in the UI)
  // rather than failing Zod validation and going 404.
  keyTakeaways: z.array(z.string()).default([]),
  redFlags: z.array(RedFlagSchema).default([]),
  benchmarkComparisons: z.array(BenchmarkComparisonSchema).default([]),
  recommendations: z.array(RecommendationSchema).default([]),
  actionItems: z.array(ActionItemSchema).default([]),
  questionsToAsk: z.array(AgencyQuestionSchema).default([]),
  overallAssessment: z.enum(["looks_reasonable", "some_concerns", "significant_concerns"]),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// A much lighter extraction than AnalysisResultSchema - a CRM/sales export
// has no channel mix, benchmarks, or red flags to reason about. This exists
// purely to plot revenue and deal volume over time, the same way a
// month-over-month ad report gets plotted on Trends.
export const SalesDataResultSchema = z.object({
  reportingPeriod: nullableString,
  reportingPeriodStart: nullableDateString,
  totalRevenue: nullableString,
  totalRevenueNumeric: nullableNumber,
  dealCount: nullableString,
  dealCountNumeric: nullableNumber,
  avgDealSize: nullableString,
  avgDealSizeNumeric: nullableNumber,
  notes: nullableString,
});

export type SalesDataResult = z.infer<typeof SalesDataResultSchema>;
