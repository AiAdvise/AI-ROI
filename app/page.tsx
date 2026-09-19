"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import SalesUploadForm from "@/components/SalesUploadForm";
import ResultsView from "@/components/ResultsView";
import SalesResultsView from "@/components/SalesResultsView";
import ReportActions from "@/components/ReportActions";
import ReportPreviewMockup from "@/components/ReportPreviewMockup";
import BrandMark from "@/components/BrandMark";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";
import MarketingLandingPage from "@/components/MarketingLandingPage";
import AnonymousAccountBanner from "@/components/AnonymousAccountBanner";
import { createClient } from "@/lib/supabase/client";
import type { AnalysisResult, SalesDataResult } from "@/lib/types";

type Status = "idle" | "analyzing" | "done";

const GENERIC_TIMEOUT_MESSAGE =
  "The server took too long or hit an unexpected error. Please try again - if it keeps " +
  "happening, try a smaller or simpler file.";

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [hasUser, setHasUser] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [agencyFile, setAgencyFile] = useState<File | null>(null);
  const [trade, setTrade] = useState<string>("");
  const [spendNotes, setSpendNotes] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [agencyError, setAgencyError] = useState<string | null>(null);

  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [salesNotes, setSalesNotes] = useState<string>("");
  const [salesResult, setSalesResult] = useState<SalesDataResult | null>(null);
  const [salesResultId, setSalesResultId] = useState<string | null>(null);
  const [salesError, setSalesError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasUser(!!data.user);
      setAuthChecked(true);

      if (data.user?.is_anonymous) {
        setIsAnonymous(true);
        supabase
          .from("profiles")
          .select("email")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => setPendingEmail(profile?.email ?? null));
      }
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function uploadAgencyReport() {
    if (!agencyFile) return;
    try {
      const formData = new FormData();
      formData.append("file", agencyFile);
      if (trade) formData.append("trade", trade);
      if (spendNotes) formData.append("spendNotes", spendNotes);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });

      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error(GENERIC_TIMEOUT_MESSAGE);
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong analyzing your report.");
      }

      setResult(data.result as AnalysisResult);
      setResultId(data.reportId ?? null);
    } catch (err) {
      setAgencyError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function uploadSalesData() {
    if (!salesFile) return;
    try {
      const formData = new FormData();
      formData.append("file", salesFile);
      if (salesNotes) formData.append("notes", salesNotes);

      const res = await fetch("/api/analyze-sales", { method: "POST", body: formData });

      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error(GENERIC_TIMEOUT_MESSAGE);
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong extracting your sales data.");
      }

      setSalesResult(data.result as SalesDataResult);
      setSalesResultId(data.reportId ?? null);
    } catch (err) {
      setSalesError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyFile && !salesFile) {
      setFormError("Attach your agency report, your sales data, or both to continue.");
      return;
    }

    setFormError(null);
    setStatus("analyzing");
    setResult(null);
    setResultId(null);
    setAgencyError(null);
    setSalesResult(null);
    setSalesResultId(null);
    setSalesError(null);

    await Promise.all([uploadAgencyReport(), uploadSalesData()]);

    setStatus("done");
  }

  function reset() {
    setStatus("idle");
    setFormError(null);
    setAgencyFile(null);
    setTrade("");
    setSpendNotes("");
    setResult(null);
    setResultId(null);
    setAgencyError(null);
    setSalesFile(null);
    setSalesNotes("");
    setSalesResult(null);
    setSalesResultId(null);
    setSalesError(null);
  }

  const showCombinedSnapshot =
    result?.documentSummary.totalSpendNumeric != null && salesResult?.totalRevenueNumeric != null;

  if (!authChecked) {
    return <div className="min-h-screen bg-[#14283D]" />;
  }

  if (!hasUser) {
    return <MarketingLandingPage />;
  }

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-line bg-paper-raised">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <BrandMark className="text-lg" />
          <div className="flex items-center gap-4">
            {hasUser && (
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
            {hasUser ? (
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

      {isAnonymous && <AnonymousAccountBanner email={pendingEmail} />}

      <main className="relative px-4 py-14 sm:py-20">
        {status !== "done" && <GradientBlobs />}

        {status !== "done" && (
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <Reveal>
                <div>
                  <div className="text-center lg:text-left">
                    <h1 className="gradient-text font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                      Your monthly marketing &amp; sales check-in
                    </h1>
                    <p className="mt-4 text-ink-soft leading-relaxed">
                      Upload this month&apos;s agency report, your sales/CRM export, or both
                      together. We&apos;ll diagnose the ad report against a real media-buying
                      framework, track your sales over time, and - when you upload both - show you
                      whether the spend is actually turning into business.
                    </p>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-2">
                        Agency / Media Report
                      </p>
                      <UploadForm
                        file={agencyFile}
                        onFileChange={setAgencyFile}
                        trade={trade}
                        onTradeChange={setTrade}
                        spendNotes={spendNotes}
                        onSpendNotesChange={setSpendNotes}
                        disabled={status === "analyzing"}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-2">
                        Sales Data (CRM)
                      </p>
                      <SalesUploadForm
                        file={salesFile}
                        onFileChange={setSalesFile}
                        notes={salesNotes}
                        onNotesChange={setSalesNotes}
                        disabled={status === "analyzing"}
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="mt-4 rounded-lg bg-severe-soft px-3 py-2 text-sm text-severe text-center">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "analyzing" || (!agencyFile && !salesFile)}
                    className="mt-5 w-full rounded-lg bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-[length:160%_100%] bg-[position:0%_0%] px-4 py-3 font-medium text-white shadow-md transition-[background-position,transform,box-shadow] duration-300 hover:bg-[position:100%_0%] hover:shadow-lg active:scale-[0.99] disabled:opacity-40 disabled:hover:bg-[position:0%_0%] disabled:hover:shadow-md"
                  >
                    {status === "analyzing" ? "Processing..." : "Upload this month's data"}
                  </button>
                </div>
              </Reveal>

              <Reveal delay={160} className="hidden lg:block">
                <ReportPreviewMockup />
              </Reveal>
            </div>
          </form>
        )}

        {status === "analyzing" && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="h-1.5 w-40 overflow-hidden rounded-full bg-line">
              <span className="block h-full w-1/3 animate-[loadbar_1.1s_ease-in-out_infinite] rounded-full bg-accent" />
            </span>
            <p className="text-center text-sm text-ink-soft">
              Reading what you uploaded - this can take up to a couple of minutes,
              especially with both files at once.
            </p>
          </div>
        )}

        {status === "done" && (
          <div className="mt-2">
            <div className="no-print max-w-4xl mx-auto mb-6">
              <button
                onClick={reset}
                className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                &larr; Upload another month
              </button>
            </div>

            {showCombinedSnapshot && result && salesResult && (
              <Reveal className="max-w-4xl mx-auto mb-8">
                <div className="rounded-xl border border-accent/20 bg-accent-soft p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
                    This month at a glance
                  </p>
                  <p className="text-sm text-ink leading-relaxed">
                    You spent{" "}
                    <span className="font-semibold">
                      ${result.documentSummary.totalSpendNumeric!.toLocaleString()}
                    </span>{" "}
                    on ads against{" "}
                    <span className="font-semibold">
                      ${salesResult.totalRevenueNumeric!.toLocaleString()}
                    </span>{" "}
                    in reported revenue
                    {salesResult.dealCount ? ` (${salesResult.dealCount})` : ""}. See the{" "}
                    <Link href="/trends" className="underline underline-offset-4 hover:text-ink">
                      Trends page
                    </Link>{" "}
                    once you&apos;ve uploaded a couple of months to see whether spend changes
                    track with revenue changes.
                  </p>
                </div>
              </Reveal>
            )}

            {agencyFile && (
              <div className="mb-10">
                {result ? (
                  <>
                    <div className="no-print max-w-4xl mx-auto mb-4 flex justify-end">
                      <ReportActions result={result} />
                    </div>
                    <ResultsView result={result} />
                    {resultId && (
                      <p className="no-print max-w-4xl mx-auto mt-3 text-center text-xs text-ink-soft">
                        <Link
                          href={`/reports/${resultId}`}
                          className="underline underline-offset-4 hover:text-ink"
                        >
                          View this report&apos;s permanent page
                        </Link>
                      </p>
                    )}
                  </>
                ) : (
                  agencyError && (
                    <div className="max-w-xl mx-auto rounded-lg border border-severe/20 bg-severe-soft p-4 text-sm text-severe">
                      <p className="font-medium mb-1">Agency report upload failed</p>
                      {agencyError}
                    </div>
                  )
                )}
              </div>
            )}

            {salesFile && (
              <div>
                {salesResult ? (
                  <>
                    <SalesResultsView result={salesResult} />
                    {salesResultId && (
                      <p className="no-print max-w-4xl mx-auto mt-3 text-center text-xs text-ink-soft">
                        <Link
                          href={`/sales/${salesResultId}`}
                          className="underline underline-offset-4 hover:text-ink"
                        >
                          View this snapshot&apos;s permanent page
                        </Link>
                      </p>
                    )}
                  </>
                ) : (
                  salesError && (
                    <div className="max-w-xl mx-auto rounded-lg border border-severe/20 bg-severe-soft p-4 text-sm text-severe">
                      <p className="font-medium mb-1">Sales data upload failed</p>
                      {salesError}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
