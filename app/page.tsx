"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ResultsView from "@/components/ResultsView";
import type { AnalysisResult } from "@/lib/types";

type Status = "idle" | "analyzing" | "error" | "done";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  async function handleSubmit(file: File, trade: string | null, spendNotes: string | null) {
    setStatus("analyzing");
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (trade) formData.append("trade", trade);
      if (spendNotes) formData.append("spendNotes", spendNotes);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error(
          "The server took too long or hit an unexpected error. Please try again - if it " +
            "keeps happening, try a smaller or simpler file.",
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong analyzing your report.");
      }

      setResult(data.result as AnalysisResult);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  async function downloadPdf() {
    if (!result || downloadingPdf) return;
    setDownloadingPdf(true);
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
    <div className="min-h-screen">
      <header className="no-print border-b border-line bg-paper-raised">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-serif text-lg font-semibold tracking-tight text-ink">
            Media Plan Diagnostic
          </span>
          <span className="hidden sm:block text-xs font-medium uppercase tracking-widest text-ink-soft">
            Ad Spend Audit
          </span>
        </div>
      </header>

      <main className="px-4 py-14 sm:py-20">
        {status !== "done" && (
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-ink text-balance">
              Is your agency&apos;s report actually telling you anything?
            </h1>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Upload the ad report or media plan your agency sent you. We&apos;ll diagnose it
              against a real media-buying framework: what&apos;s reasonable, what&apos;s missing,
              and exactly what to ask your agency at your next call.
            </p>
          </div>
        )}

        {status !== "done" && (
          <UploadForm onSubmit={handleSubmit} disabled={status === "analyzing"} />
        )}

        {status === "analyzing" && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="h-1.5 w-40 overflow-hidden rounded-full bg-line">
              <span className="block h-full w-1/3 animate-[loadbar_1.1s_ease-in-out_infinite] rounded-full bg-accent" />
            </span>
            <p className="text-center text-sm text-ink-soft">
              Reading your report and comparing it against the diagnostic framework - this can
              take up to a minute.
            </p>
          </div>
        )}

        {status === "error" && error && (
          <div className="max-w-xl mx-auto mt-6 rounded-lg border border-severe/20 bg-severe-soft p-4 text-sm text-severe">
            {error}
          </div>
        )}

        {status === "done" && result && (
          <div className="mt-2">
            <div className="no-print max-w-3xl mx-auto mb-6 flex items-center justify-between gap-4">
              <button
                onClick={reset}
                className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                &larr; Analyze another report
              </button>
              <div className="flex items-center gap-4">
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
            </div>
            <ResultsView result={result} />
          </div>
        )}
      </main>
    </div>
  );
}
