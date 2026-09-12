import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResultsView from "@/components/ResultsView";
import ReportActions from "@/components/ReportActions";
import AskAboutReport from "@/components/AskAboutReport";
import BrandMark from "@/components/BrandMark";
import Reveal from "@/components/Reveal";
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
          <Link href="/">
            <BrandMark className="text-lg" />
          </Link>
          <div className="flex items-center gap-4">
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
            <Link
              href="/"
              className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              New diagnostic
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-14 sm:py-20">
        <div className="no-print max-w-3xl mx-auto mb-6 flex justify-end">
          <ReportActions result={parsed.data} />
        </div>
        <div className="max-w-3xl mx-auto mb-6">
          <Reveal>
            <AskAboutReport reportId={report.id} />
          </Reveal>
        </div>
        <ResultsView result={parsed.data} />
      </main>
    </div>
  );
}
