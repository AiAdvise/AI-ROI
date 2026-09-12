import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResultsView from "@/components/ResultsView";
import { AnalysisResultSchema } from "@/lib/types";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("id, result, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !report) {
    notFound();
  }

  const parsed = AnalysisResultSchema.safeParse(report.result);
  if (!parsed.success) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-line bg-paper-raised">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-tight text-ink"
          >
            Media Plan Diagnostic
          </Link>
          <Link
            href="/history"
            className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            &larr; Back to history
          </Link>
        </div>
      </header>

      <main className="px-4 py-14 sm:py-20">
        <ResultsView result={parsed.data} />
      </main>
    </div>
  );
}
