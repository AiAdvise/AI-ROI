import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HistoryList from "@/components/HistoryList";
import { effectiveDate } from "@/lib/trends";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows, error } = await supabase
    .from("reports")
    .select(
      "id, business_type, trade, reporting_period, reporting_period_start, overall_assessment, created_at",
    );

  // Sorted by the period each report covers, not upload order - so reports
  // run out of order (e.g. backfilling an older month) still list correctly.
  const reports = rows
    ? [...rows].sort(
        (a, b) =>
          new Date(effectiveDate(b.reporting_period_start, b.created_at)).getTime() -
          new Date(effectiveDate(a.reporting_period_start, a.created_at)).getTime(),
      )
    : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper-raised">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-tight text-ink"
          >
            Media Plan Diagnostic
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/trends"
              className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Trends
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              New diagnostic
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink mb-6">
          Report history
        </h1>

        {error && (
          <p className="text-sm text-severe">Couldn&apos;t load your report history.</p>
        )}

        {!error && (!reports || reports.length === 0) && (
          <p className="text-sm text-ink-soft">
            You haven&apos;t run any diagnostics yet.{" "}
            <Link href="/" className="underline underline-offset-4 hover:text-ink">
              Run your first one.
            </Link>
          </p>
        )}

        {reports && reports.length > 0 && <HistoryList reports={reports} />}
      </main>
    </div>
  );
}
