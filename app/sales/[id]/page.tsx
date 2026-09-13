import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SalesResultsView from "@/components/SalesResultsView";
import BrandMark from "@/components/BrandMark";
import { SalesDataResultSchema } from "@/lib/types";

export default async function SalesReportDetailPage({
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
    .from("sales_reports")
    .select("id, result, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !report) {
    notFound();
  }

  const parsed = SalesDataResultSchema.safeParse(report.result);
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
              New upload
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-14 sm:py-20">
        <SalesResultsView result={parsed.data} />
      </main>
    </div>
  );
}
