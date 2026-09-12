import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ComparisonView from "@/components/ComparisonView";
import { AnalysisResultSchema } from "@/lib/types";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  if (!a || !b || a === b) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows, error } = await supabase
    .from("reports")
    .select("id, result, created_at")
    .in("id", [a, b]);

  if (error || !rows || rows.length !== 2) {
    notFound();
  }

  const parsedRows = rows.map((r) => {
    const parsed = AnalysisResultSchema.safeParse(r.result);
    return parsed.success ? { created_at: r.created_at as string, result: parsed.data } : null;
  });

  if (parsedRows.some((r) => r === null)) {
    notFound();
  }

  const [first, second] = parsedRows as { created_at: string; result: ReturnType<typeof AnalysisResultSchema.parse> }[];
  const [earlier, later] =
    new Date(first.created_at).getTime() <= new Date(second.created_at).getTime()
      ? [first, second]
      : [second, first];

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-line bg-paper-raised">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-semibold tracking-tight text-ink">
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
        <ComparisonView earlier={earlier} later={later} />
      </main>
    </div>
  );
}
