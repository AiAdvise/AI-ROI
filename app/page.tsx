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

  async function handleSubmit(file: File, trade: string | null) {
    setStatus("analyzing");
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (trade) formData.append("trade", trade);

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

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Media Plan Diagnostic</h1>
        <p className="mt-3 text-gray-600">
          Upload your agency&apos;s ad report or media plan and get a plain-English diagnosis:
          what&apos;s reasonable, what&apos;s missing, and exactly what to ask your agency.
        </p>
      </div>

      {status !== "done" && (
        <UploadForm onSubmit={handleSubmit} disabled={status === "analyzing"} />
      )}

      {status === "analyzing" && (
        <p className="mt-6 text-center text-sm text-gray-500">
          Reading your report and comparing it against the diagnostic framework - this can take
          up to a minute...
        </p>
      )}

      {status === "error" && error && (
        <div className="max-w-xl mx-auto mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-4">
          <div className="max-w-3xl mx-auto mb-6 flex justify-end">
            <button
              onClick={reset}
              className="text-sm font-medium text-gray-600 underline underline-offset-4"
            >
              Analyze another report
            </button>
          </div>
          <ResultsView result={result} />
        </div>
      )}
    </main>
  );
}
