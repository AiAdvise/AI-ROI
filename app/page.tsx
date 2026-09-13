"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import SalesUploadForm from "@/components/SalesUploadForm";
import ResultsView from "@/components/ResultsView";
import SalesResultsView from "@/components/SalesResultsView";
import ReportActions from "@/components/ReportActions";
import BrandMark from "@/components/BrandMark";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/client";
import type { AnalysisResult, SalesDataResult } from "@/lib/types";

type Status = "idle" | "analyzing" | "error" | "done";
type UploadKind = "agency" | "sales";

const UPLOAD_KINDS: { value: UploadKind; label: string }[] = [
  { value: "agency", label: "Agency / Media Report" },
  { value: "sales", label: "Sales Data (CRM)" },
];

export default function Home() {
  const router = useRouter();
  const [uploadKind, setUploadKind] = useState<UploadKind>("agency");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [salesResult, setSalesResult] = useState<SalesDataResult | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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

      if (data.reportId) {
        router.push(`/reports/${data.reportId}`);
        return;
      }

      setResult(data.result as AnalysisResult);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  async function handleSalesSubmit(file: File, notes: string | null) {
    setStatus("analyzing");
    setError(null);
    setSalesResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (notes) formData.append("notes", notes);

      const res = await fetch("/api/analyze-sales", {
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
        throw new Error(data.error ?? "Something went wrong extracting your sales data.");
      }

      if (data.reportId) {
        router.push(`/sales/${data.reportId}`);
        return;
      }

      setSalesResult(data.result as SalesDataResult);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setSalesResult(null);
    setError(null);
  }

  function selectUploadKind(kind: UploadKind) {
    setUploadKind(kind);
    setError(null);
  }

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-line bg-paper-raised">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <BrandMark className="text-lg" />
          <div className="flex items-center gap-4">
            {userEmail && (
              <>
                <Link
                  href="/trends"
                  className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
                >
                  Trends
                </Link>
                <Link
                  href="/history"
                  className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
                >
                  History
                </Link>
              </>
            )}
            {userEmail ? (
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative px-4 py-14 sm:py-20">
        {status !== "done" && <GradientBlobs />}
        {status !== "done" && (
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h1 className="gradient-text font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              {uploadKind === "agency"
                ? "Is your agency's report actually telling you anything?"
                : "Track your sales month over month"}
            </h1>
            <p className="mt-4 text-ink-soft leading-relaxed">
              {uploadKind === "agency"
                ? "Upload the ad report or media plan your agency sent you. We'll diagnose it against a real media-buying framework: what's reasonable, what's missing, and exactly what to ask your agency at your next call."
                : "Upload a sales or CRM export and we'll track revenue, deal volume, and average sale size over time - so you can see whether your ad spend is actually moving the needle."}
            </p>
          </div>
        )}

        {status !== "done" && (
          <div className="mx-auto mb-6 flex max-w-xl justify-center gap-2">
            {UPLOAD_KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => selectUploadKind(k.value)}
                disabled={status === "analyzing"}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  uploadKind === k.value
                    ? "bg-ink text-white shadow-sm"
                    : "bg-paper-raised text-ink-soft border border-line hover:text-ink"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        )}

        {status !== "done" && (
          <Reveal delay={120}>
            {uploadKind === "agency" ? (
              <UploadForm onSubmit={handleSubmit} disabled={status === "analyzing"} />
            ) : (
              <SalesUploadForm onSubmit={handleSalesSubmit} disabled={status === "analyzing"} />
            )}
          </Reveal>
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
            <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between gap-4">
              <button
                onClick={reset}
                className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                &larr; Analyze another report
              </button>
              <ReportActions result={result} />
            </div>
            <ResultsView result={result} />
          </div>
        )}

        {status === "done" && salesResult && (
          <div className="mt-2">
            <div className="no-print max-w-4xl mx-auto mb-6">
              <button
                onClick={reset}
                className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                &larr; Upload another sales file
              </button>
            </div>
            <SalesResultsView result={salesResult} />
          </div>
        )}
      </main>
    </div>
  );
}
