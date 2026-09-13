import type { AnalysisResult } from "./types";

export interface HealthScore {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  tone: "good" | "caution" | "severe";
}

const GRADE_BANDS: { min: number; grade: HealthScore["grade"]; tone: HealthScore["tone"] }[] = [
  { min: 90, grade: "A", tone: "good" },
  { min: 75, grade: "B", tone: "good" },
  { min: 60, grade: "C", tone: "caution" },
  { min: 40, grade: "D", tone: "caution" },
  { min: 0, grade: "F", tone: "severe" },
];

/**
 * A deterministic 0-100 score computed from the report's own structured
 * findings - never a separate model call, and never a number the model
 * invents on its own. Red flags are the only input: they're the one field
 * the framework already requires to be grounded in something concretely
 * wrong with the report, so deducting by severity gives a second, at-a-
 * glance signal alongside the categorical overallAssessment badge without
 * fabricating a dollar figure the report's own numbers don't support.
 */
export function computeHealthScore(result: AnalysisResult): HealthScore {
  let score = 100;
  for (const flag of result.redFlags) {
    if (flag.severity === "high") score -= 22;
    else if (flag.severity === "medium") score -= 10;
    else score -= 4;
  }
  score = Math.max(0, Math.min(100, score));

  const band = GRADE_BANDS.find((b) => score >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
  return { score, grade: band.grade, tone: band.tone };
}
