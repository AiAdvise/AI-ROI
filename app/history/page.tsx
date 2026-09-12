import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const OVERALL_LABEL: Record<string, string> = {
  looks_reasonable: "Looks reasonable",
  some_concerns: "Some concerns",
  significant_concerns: "Significant concerns",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: reports, error } = await supabase
    .from("reports")
    .select("id, business_type, trade, reporting_period, overall_assessment, created_at")
    .order("created_at", { ascending: false });

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
          <Link
            href="/"
            className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            New diagnostic
          </Link>
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

        {reports && reports.length > 0 && (
          <ul className="divide-y divide-line rounded-lg border border-line bg-paper-raised">
            {reports.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/reports/${r.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-paper"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {r.business_type ?? r.trade ?? "Media plan diagnostic"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {formatDate(r.created_at)}
                      {r.reporting_period ? ` · ${r.reporting_period}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-ink-soft">
                    {r.overall_assessment
                      ? OVERALL_LABEL[r.overall_assessment] ?? r.overall_assessment
                      : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
