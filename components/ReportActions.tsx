"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";

export default function ReportActions({ result }: { result: AnalysisResult }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadPdf() {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    setError(null);
    try {
      const [{ pdf }, { default: ReportPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/ReportPdfDocument"),
      ]);

      const blob = await pdf(<ReportPdfDocument result={result} />).toBlob();
      const url = URL.createObjectURL(blob);
      const business = result.documentSummary.businessType
        ?.replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
      const filename = `media-plan-diagnostic${business ? `-${business}` : ""}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Couldn't generate the PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {error && <span className="text-sm text-severe">{error}</span>}
      <button
        onClick={() => window.print()}
        className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        Print
      </button>
      <button
        onClick={downloadPdf}
        disabled={downloadingPdf}
        className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
      >
        {downloadingPdf ? "Preparing PDF..." : "Download PDF"}
      </button>
    </div>
  );
}
