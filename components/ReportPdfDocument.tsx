import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AnalysisResult } from "@/lib/types";

const COLORS = {
  ink: "#1c2434",
  inkSoft: "#3d465a",
  paper: "#faf8f4",
  line: "#e4e0d7",
  accent: "#b3541e",
  accentSoft: "#fdf1e7",
  severe: "#9f2b1f",
  severeSoft: "#fbebe9",
  caution: "#95610f",
  cautionSoft: "#fbf1e0",
  good: "#3f6b4a",
  goodSoft: "#eaf2ec",
  white: "#ffffff",
};

const SEVERITY_META: Record<string, { label: string; border: string; bg: string; color: string }> = {
  high: { label: "High", border: COLORS.severe, bg: COLORS.severeSoft, color: COLORS.severe },
  medium: { label: "Medium", border: COLORS.caution, bg: COLORS.cautionSoft, color: COLORS.caution },
  low: { label: "Low", border: COLORS.line, bg: COLORS.paper, color: COLORS.inkSoft },
};

const ASSESSMENT_META: Record<string, { label: string; bg: string; color: string }> = {
  above: { label: "Above benchmark - worth a look", bg: COLORS.cautionSoft, color: COLORS.caution },
  within: { label: "Within normal range", bg: COLORS.goodSoft, color: COLORS.good },
  below: { label: "Below benchmark - worth a look", bg: COLORS.cautionSoft, color: COLORS.caution },
  no_benchmark_available: { label: "No benchmark available", bg: COLORS.paper, color: COLORS.inkSoft },
  insufficient_data: {
    label: "Can't calculate - report is missing data",
    bg: COLORS.severeSoft,
    color: COLORS.severe,
  },
};

const OVERALL_META: Record<string, string> = {
  looks_reasonable: "Looks reasonable",
  some_concerns: "Some concerns",
  significant_concerns: "Significant concerns",
};

function benchmarkRangeText(b: AnalysisResult["benchmarkComparisons"][number]): string {
  if (b.benchmarkRange in ASSESSMENT_META) {
    return ASSESSMENT_META[b.benchmarkRange].label;
  }
  return b.benchmarkRange;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  brand: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  scorecard: {
    backgroundColor: COLORS.ink,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff99",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  businessTitle: {
    fontFamily: "Times-Bold",
    fontSize: 16,
    color: COLORS.white,
    flexShrink: 1,
    marginRight: 8,
  },
  badge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 10,
    color: "#ffffffd9",
    lineHeight: 1.5,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: "#ffffff26",
    paddingTop: 10,
  },
  metaLabel: { fontSize: 8, color: "#ffffff80" },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: COLORS.white, marginTop: 2 },
  sectionEyebrow: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: 10,
  },
  section: { marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  findingCard: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  cardTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: COLORS.ink, flexShrink: 1 },
  cardBody: { fontSize: 9.5, color: COLORS.inkSoft, lineHeight: 1.5 },
  cardMeta: { fontSize: 8.5, color: COLORS.inkSoft, marginTop: 4, opacity: 0.75 },
  table: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 6, overflow: "hidden" },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.paper,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.line },
  th: { flex: 1, padding: 6, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: COLORS.inkSoft },
  td: { flex: 1, padding: 6, fontSize: 8.5, color: COLORS.inkSoft },
  questionsBox: {
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accent + "33",
    borderRadius: 8,
    padding: 16,
  },
  questionRow: { flexDirection: "row", marginBottom: 10, gap: 8 },
  questionNum: { fontFamily: "Times-Bold", fontSize: 10, color: COLORS.accent, width: 14 },
  questionText: { fontFamily: "Helvetica-Bold", fontSize: 10, color: COLORS.ink, marginBottom: 2 },
  questionWhy: { fontSize: 9, color: COLORS.inkSoft, lineHeight: 1.4 },
});

export default function ReportPdfDocument({ result }: { result: AnalysisResult }) {
  const { documentSummary } = result;
  const overallLabel = OVERALL_META[result.overallAssessment] ?? result.overallAssessment;

  return (
    <Document title="Media Plan Diagnostic Report">
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.brand}>Media Plan Diagnostic</Text>

        <View style={styles.scorecard}>
          <Text style={styles.eyebrow}>Diagnostic Summary</Text>
          <View style={styles.titleRow}>
            <Text style={styles.businessTitle}>
              {documentSummary.businessType ?? "Media Plan Review"}
            </Text>
            <Text style={[styles.badge, { backgroundColor: "#ffffff26", color: COLORS.white }]}>
              {overallLabel}
            </Text>
          </View>
          <Text style={styles.summaryText}>{result.plainEnglishSummary}</Text>
          <View style={styles.metaRow}>
            {documentSummary.reportingPeriod && (
              <View>
                <Text style={styles.metaLabel}>Reporting period</Text>
                <Text style={styles.metaValue}>{documentSummary.reportingPeriod}</Text>
              </View>
            )}
            {documentSummary.totalSpend && (
              <View>
                <Text style={styles.metaLabel}>Total spend</Text>
                <Text style={styles.metaValue}>{documentSummary.totalSpend}</Text>
              </View>
            )}
          </View>
        </View>

        {documentSummary.channelMix.length > 0 && (
          <View style={[styles.table, { marginBottom: 20 }]}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.th}>Channel</Text>
              <Text style={styles.th}>Spend</Text>
              <Text style={styles.th}>% of total</Text>
              <Text style={[styles.th, { flex: 2 }]}>Notes</Text>
            </View>
            {documentSummary.channelMix.map((c, i) => (
              <View
                style={i === documentSummary.channelMix.length - 1 ? styles.tableRow : styles.tableRow}
                key={i}
              >
                <Text style={[styles.td, { fontFamily: "Helvetica-Bold", color: COLORS.ink }]}>
                  {c.channel}
                </Text>
                <Text style={styles.td}>{c.spend ?? "-"}</Text>
                <Text style={styles.td}>{c.percentOfTotal ?? "-"}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{c.notes ?? "-"}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>What we found</Text>
          <Text style={styles.sectionTitle}>Findings</Text>
          {result.redFlags.length === 0 ? (
            <Text style={styles.cardBody}>No red flags identified.</Text>
          ) : (
            result.redFlags.map((flag, i) => {
              const meta = SEVERITY_META[flag.severity] ?? SEVERITY_META.low;
              return (
                <View
                  key={i}
                  style={[styles.findingCard, { borderLeftColor: meta.border }]}
                  wrap={false}
                >
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>
                      {String(i + 1).padStart(2, "0")}  {flag.title}
                    </Text>
                    <Text style={[styles.badge, { backgroundColor: meta.bg, color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>
                  <Text style={styles.cardBody}>{flag.reasoning}</Text>
                  {flag.relatedChannel && (
                    <Text style={styles.cardMeta}>Channel: {flag.relatedChannel}</Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>How the numbers stack up</Text>
          <Text style={styles.sectionTitle}>Benchmark comparisons</Text>
          {result.benchmarkComparisons.length === 0 ? (
            <Text style={styles.cardBody}>No benchmark comparisons available.</Text>
          ) : (
            result.benchmarkComparisons.map((b, i) => {
              const meta = ASSESSMENT_META[b.assessment] ?? ASSESSMENT_META.no_benchmark_available;
              return (
                <View key={i} style={styles.card} wrap={false}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{b.metric}</Text>
                    <Text style={[styles.badge, { backgroundColor: meta.bg, color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>
                  <Text style={[styles.cardBody, { marginBottom: 4 }]}>
                    Reported: {b.reportedValue} - Benchmark: {benchmarkRangeText(b)}
                  </Text>
                  <Text style={styles.cardBody}>{b.commentary}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.questionsBox} wrap={false}>
          <Text style={styles.sectionEyebrow}>Bring this to your next call</Text>
          <Text style={styles.sectionTitle}>Questions to ask your agency</Text>
          {result.questionsToAsk.map((q, i) => (
            <View key={i} style={styles.questionRow}>
              <Text style={styles.questionNum}>{i + 1}.</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.questionText}>{q.question}</Text>
                <Text style={styles.questionWhy}>{q.whyItMatters}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
