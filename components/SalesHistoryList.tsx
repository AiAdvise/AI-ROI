"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { effectiveDate, monthLabel } from "@/lib/trends";

export interface SalesHistoryRow {
  id: string;
  reporting_period: string | null;
  reporting_period_start: string | null;
  created_at: string;
}

export default function SalesHistoryList({ reports }: { reports: SalesHistoryRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;

    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/sales-reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Couldn't delete that sales report.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that sales report.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
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
              <Link
                href={`/sales/${r.id}`}
                className="flex flex-1 items-center justify-between gap-4 hover:opacity-70"
              >
                <div>
                  <p className="text-sm font-medium text-ink">Sales snapshot</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {label}
                    {r.reporting_period ? ` · ${r.reporting_period}` : ""}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(r.id, label)}
                disabled={deletingId === r.id}
                className="shrink-0 text-xs font-medium text-ink-soft underline underline-offset-4 hover:text-severe disabled:opacity-50"
              >
                {deletingId === r.id ? "Deleting…" : "Delete"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
