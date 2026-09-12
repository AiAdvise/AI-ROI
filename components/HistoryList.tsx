"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { effectiveDate, monthLabel } from "@/lib/trends";

const OVERALL_LABEL: Record<string, string> = {
  looks_reasonable: "Looks reasonable",
  some_concerns: "Some concerns",
  significant_concerns: "Significant concerns",
};

export interface HistoryReportRow {
  id: string;
  business_type: string | null;
  trade: string | null;
  reporting_period: string | null;
  reporting_period_start: string | null;
  overall_assessment: string | null;
  created_at: string;
}

export default function HistoryList({ reports }: { reports: HistoryReportRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;

    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Couldn't delete that report.");
      }
      setSelected((prev) => prev.filter((x) => x !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that report.");
    } finally {
      setDeletingId(null);
    }
  }

  const canCompare = selected.length === 2;
  const compareHref = canCompare ? `/compare?a=${selected[0]}&b=${selected[1]}` : "#";

  return (
    <div className={canCompare ? "pb-20" : undefined}>
      {reports.length > 1 && (
        <p className="mb-4 text-sm text-ink-soft">
          Check two reports below to compare them month over month.
        </p>
      )}

      {error && <p className="mb-4 text-sm text-severe">{error}</p>}

      <ul className="divide-y divide-line rounded-lg border border-line bg-paper-raised">
        {reports.map((r, i) => {
          const label = monthLabel(effectiveDate(r.reporting_period_start, r.created_at));
          return (
            <li
              key={r.id}
              className="flex items-center gap-3 px-4 py-4 opacity-0 animate-fadeInUp"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <input
                type="checkbox"
                checked={selected.includes(r.id)}
                onChange={() => toggle(r.id)}
                className="h-4 w-4 shrink-0 accent-ink"
                aria-label={`Select ${r.business_type ?? r.trade ?? "report"} from ${label} to compare`}
              />
              <Link
                href={`/reports/${r.id}`}
                className="flex flex-1 items-center justify-between gap-4 hover:opacity-70"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {r.business_type ?? r.trade ?? "Media plan diagnostic"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {label}
                    {r.reporting_period ? ` · ${r.reporting_period}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-ink-soft">
                  {r.overall_assessment
                    ? OVERALL_LABEL[r.overall_assessment] ?? r.overall_assessment
                    : ""}
                </span>
              </Link>
              <button
                onClick={() => handleDelete(r.id, r.business_type ?? r.trade ?? label)}
                disabled={deletingId === r.id}
                className="shrink-0 text-xs font-medium text-ink-soft underline underline-offset-4 hover:text-severe disabled:opacity-50"
              >
                {deletingId === r.id ? "Deleting…" : "Delete"}
              </button>
            </li>
          );
        })}
      </ul>

      {canCompare && (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper-raised px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <span className="text-sm text-ink-soft">2 reports selected</span>
            <Link
              href={compareHref}
              className="rounded-lg bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-[length:160%_100%] bg-[position:0%_0%] px-4 py-2 text-sm font-medium text-white shadow-sm transition-[background-position,box-shadow] duration-300 hover:bg-[position:100%_0%] hover:shadow-md"
            >
              Compare
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
