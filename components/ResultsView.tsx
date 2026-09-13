import type { AnalysisResult } from "@/lib/types";
import Reveal from "@/components/Reveal";
import EmailDraft from "@/components/EmailDraft";
import ChannelSpendDonut from "@/components/charts/ChannelSpendDonut";
import FunnelBar from "@/components/charts/FunnelBar";
import { computeHealthScore } from "@/lib/score";
import { funnelBreakdown } from "@/lib/funnel";
import { channelColorMap, colorForChannel } from "@/lib/channelColors";

const GRADE_TONE_CLASS: Record<"good" | "caution" | "severe", string> = {
  good: "bg-good text-white",
  caution: "bg-caution text-white",
  severe: "bg-severe text-white",
};

// Each severity gets a full-card tint + border, not just a small badge, so
// the cards read as distinctly colored at a glance rather than a uniform
// stack of white boxes.
const SEVERITY_META: Record<string, { label: string; card: string; badge: string }> = {
  high: {
    label: "High",
    card: "border-severe/30 bg-severe-soft print:bg-white print:border-line",
    badge: "bg-severe text-white",
  },
  medium: {
    label: "Medium",
    card: "border-caution/30 bg-caution-soft print:bg-white print:border-line",
    badge: "bg-caution text-white",
  },
  low: {
    label: "Low",
    card: "border-line bg-paper-raised",
    badge: "bg-ink-soft/10 text-ink-soft",
  },
};

// "above"/"below" don't map to good/bad on their own - above a CPL benchmark is
// bad, above a ROAS benchmark is good - so those are coded as "worth a look"
// rather than guessing a direction. "within" is the only assessment we treat as
// a clean signal, and "insufficient_data" is coded like a finding, since it
// usually means the agency's own report is withholding what's needed.
const ASSESSMENT_META: Record<string, { label: string; card: string; badge: string }> = {
  above: {
    label: "Above benchmark - worth a look",
    card: "border-caution/30 bg-caution-soft print:bg-white print:border-line",
    badge: "bg-caution text-white",
  },
  within: {
    label: "Within normal range",
    card: "border-good/30 bg-good-soft print:bg-white print:border-line",
    badge: "bg-good text-white",
  },
  below: {
    label: "Below benchmark - worth a look",
    card: "border-caution/30 bg-caution-soft print:bg-white print:border-line",
    badge: "bg-caution text-white",
  },
  no_benchmark_available: {
    label: "No benchmark available",
    card: "border-line bg-paper-raised",
    badge: "bg-ink-soft/10 text-ink-soft",
  },
  insufficient_data: {
    label: "Can't calculate - report is missing data",
    card: "border-severe/30 bg-severe-soft print:bg-white print:border-line",
    badge: "bg-severe text-white",
  },
};

const OVERALL_META: Record<string, { label: string; className: string }> = {
  looks_reasonable: { label: "Looks reasonable", className: "bg-white/15 text-white" },
  some_concerns: { label: "Some concerns", className: "bg-caution-soft text-caution" },
  significant_concerns: { label: "Significant concerns", className: "bg-severe-soft text-severe" },
};

function benchmarkRangeText(b: AnalysisResult["benchmarkComparisons"][number]): string {
  // Defensive fallback in case the model puts the raw assessment value in
  // benchmarkRange instead of readable prose - never show a raw enum to the user.
  if (b.benchmarkRange in ASSESSMENT_META) {
    return ASSESSMENT_META[b.benchmarkRange].label;
  }
  return b.benchmarkRange;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent print:text-accent">
        {eyebrow}
      </p>
      <h2 className="gradient-text font-serif text-2xl font-semibold mt-1">{title}</h2>
    </div>
  );
}

export default function ResultsView({ result }: { result: AnalysisResult }) {
  const overall = OVERALL_META[result.overallAssessment];
  const { documentSummary } = result;
  const health = computeHealthScore(result);
  const funnel = funnelBreakdown(result);
  const kpiColorMap = channelColorMap(documentSummary.channelMix);
  const hasDonut =
    documentSummary.channelMix.filter((c) => c.spendNumeric != null && c.spendNumeric > 0).length >= 2;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#2a1f3d] to-[#4a1730] px-6 py-8 sm:px-10 sm:py-10 shadow-xl print:bg-white print:border print:border-line print:shadow-none">
          <div
            aria-hidden
            className="no-print pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-brand-b/30 blur-3xl animate-floatBlob"
          />
          <div
            aria-hidden
            className="no-print pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-brand-c/25 blur-3xl animate-floatBlobSlow"
          />
          <div className="relative flex flex-col-reverse sm:flex-row sm:items-start gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 print:text-ink-soft">
                Diagnostic Summary
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white print:text-ink">
                  {documentSummary.businessType ?? "Media Plan Review"}
                </h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 backdrop-blur-sm ${overall.className}`}
                >
                  {overall.label}
                </span>
              </div>
              {result.keyTakeaways.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50 print:text-ink-soft mb-2">
                    Key Takeaways
                  </p>
                  <ul className="space-y-1.5">
                    {result.keyTakeaways.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/90 leading-relaxed print:text-ink">
                        <span className="text-white/40 print:text-accent mt-0.5 shrink-0">&bull;</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-white/85 leading-relaxed print:text-ink">
                  {result.plainEnglishSummary}
                </p>
              )}

              <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm border-t border-white/15 pt-5 print:border-line">
                {documentSummary.reportingPeriod && (
                  <div>
                    <dt className="text-white/50 print:text-ink-soft">Reporting period</dt>
                    <dd className="font-medium text-white print:text-ink mt-0.5">
                      {documentSummary.reportingPeriod}
                    </dd>
                  </div>
                )}
                {documentSummary.totalSpend && (
                  <div>
                    <dt className="text-white/50 print:text-ink-soft">Total spend</dt>
                    <dd className="font-medium text-white print:text-ink mt-0.5">
                      {documentSummary.totalSpend}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="shrink-0 self-center sm:self-start flex flex-col items-center">
              <div
                className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full font-serif text-4xl sm:text-5xl font-bold shadow-lg print:shadow-none print:border print:border-line ${GRADE_TONE_CLASS[health.tone]}`}
              >
                {health.grade}
              </div>
              <p className="mt-2 text-xs font-medium text-white/70 print:text-ink-soft">
                Health score: {health.score}/100
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={40} className="mt-6">
        <EmailDraft result={result} />
      </Reveal>

      {funnel && (
        <Reveal delay={60} className="mt-6">
          <div className="card-lift rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
            <SectionHeading eyebrow="Where the budget is going" title="Funnel coverage" />
            <div className={hasDonut ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" : undefined}>
              <FunnelBar breakdown={funnel} />
              {hasDonut && <ChannelSpendDonut channelMix={documentSummary.channelMix} />}
            </div>
          </div>
        </Reveal>
      )}

      {documentSummary.channelMix.length > 0 && (
        <Reveal delay={80} className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-2">
            Full channel breakdown
          </p>
          <div className="card-lift overflow-x-auto rounded-xl border border-line bg-paper-raised shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-ink-soft border-b border-line">
                  <th className="py-3 px-4 font-medium">Channel</th>
                  <th className="py-3 px-4 font-medium">Spend</th>
                  <th className="py-3 px-4 font-medium">% of total</th>
                  <th className="py-3 px-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {documentSummary.channelMix.map((c, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="py-3 px-4 font-medium text-ink">{c.channel}</td>
                    <td className="py-3 px-4 text-ink-soft">{c.spend ?? "-"}</td>
                    <td className="py-3 px-4 text-ink-soft">{c.percentOfTotal ?? "-"}</td>
                    <td className="py-3 px-4 text-ink-soft">{c.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}

      {documentSummary.reportedKpis.length > 0 && (
        <Reveal delay={140} className="mt-4">
          <div className="card-lift rounded-xl border border-line bg-paper-raised p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-3">
              Reported KPIs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {documentSummary.reportedKpis.map((k, i) => {
                const color = colorForChannel(kpiColorMap, k.channel);
                return (
                  <div
                    key={i}
                    className="rounded-lg bg-paper p-2.5"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <p className="text-[11px] uppercase tracking-wide text-ink-soft truncate">
                      {k.name}
                      {k.channel ? ` · ${k.channel}` : ""}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">{k.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}

      <div className="mt-12">
        <Reveal>
          <SectionHeading eyebrow="What we found" title="Findings" />
        </Reveal>
        {result.redFlags.length === 0 ? (
          <p className="text-sm text-ink-soft">No red flags identified.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 print:grid-cols-1">
            {result.redFlags.map((flag, i) => {
              const meta = SEVERITY_META[flag.severity];
              return (
                <Reveal key={i} delay={Math.min(i, 6) * 70}>
                  <div className={`card-lift rounded-lg border p-4 shadow-sm ${meta.card}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-sm text-ink-soft/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-medium text-ink">{flag.title}</h3>
                      </div>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 print:bg-transparent print:text-ink-soft ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-ink-soft mt-2 leading-relaxed">{flag.reasoning}</p>
                    {flag.relatedChannel && (
                      <p className="text-xs mt-2 text-ink-soft/70">
                        Channel: {flag.relatedChannel}
                      </p>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12">
        <Reveal>
          <SectionHeading eyebrow="How the numbers stack up" title="Benchmark comparisons" />
        </Reveal>
        {result.benchmarkComparisons.length === 0 ? (
          <p className="text-sm text-ink-soft">No benchmark comparisons available.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 print:grid-cols-1">
            {result.benchmarkComparisons.map((b, i) => {
              const meta = ASSESSMENT_META[b.assessment] ?? ASSESSMENT_META.no_benchmark_available;
              return (
                <Reveal key={i} delay={Math.min(i, 6) * 70}>
                  <div className={`card-lift rounded-lg border p-4 shadow-sm ${meta.card}`}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-medium text-ink">{b.metric}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 print:bg-transparent print:text-ink-soft ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-ink-soft mt-1.5">
                      Reported: <span className="font-medium text-ink">{b.reportedValue}</span> -
                      Benchmark:{" "}
                      <span className="font-medium text-ink">{benchmarkRangeText(b)}</span>
                    </p>
                    <p className="text-sm text-ink-soft mt-2 leading-relaxed">{b.commentary}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12">
        <Reveal>
          <SectionHeading eyebrow="What a media buyer would suggest" title="Recommendations" />
        </Reveal>
        {result.recommendations.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No specific recommendations - nothing in this report points to a concrete, grounded
            change to suggest.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 print:grid-cols-1">
            {result.recommendations.map((r, i) => (
              <Reveal key={i} delay={Math.min(i, 6) * 70}>
                <div className="card-lift rounded-lg border border-good/30 bg-good-soft p-4 shadow-sm print:bg-white print:border-line">
                  <h3 className="font-medium text-ink">{r.title}</h3>
                  <p className="text-sm text-ink mt-2 leading-relaxed font-medium">
                    {r.recommendation}
                  </p>
                  <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{r.reasoning}</p>
                  {r.relatedChannel && (
                    <p className="text-xs mt-2 text-ink-soft/70">Channel: {r.relatedChannel}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {result.actionItems.length > 0 && (
        <div className="mt-12">
          <Reveal>
            <SectionHeading eyebrow="Things you can check yourself" title="Action items" />
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 print:grid-cols-1">
            {result.actionItems.map((a, i) => (
              <Reveal key={i} delay={Math.min(i, 6) * 70}>
                <div className="card-lift rounded-lg border border-brand-a/30 bg-brand-a/10 p-4 shadow-sm print:bg-white print:border-line">
                  <h3 className="font-medium text-ink">{a.title}</h3>
                  <p className="text-sm text-ink mt-2 leading-relaxed font-medium">{a.action}</p>
                  <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{a.reasoning}</p>
                  {a.relatedChannel && (
                    <p className="text-xs mt-2 text-ink-soft/70">Channel: {a.relatedChannel}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <Reveal className="mt-12 mb-4">
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent-soft p-6 sm:p-8 shadow-sm print:border-line print:bg-white print:shadow-none">
          <div
            aria-hidden
            className="no-print pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-a/20 blur-3xl"
          />
          <div className="relative">
            <SectionHeading
              eyebrow="Bring this to your next call"
              title="Questions to ask your agency"
            />
            <ol className="space-y-4">
              {result.questionsToAsk.map((q, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-serif text-sm font-semibold text-accent shrink-0 mt-0.5">
                    {i + 1}.
                  </span>
                  <div>
                    <p className="font-medium text-ink">{q.question}</p>
                    <p className="text-sm text-ink-soft mt-1">{q.whyItMatters}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
