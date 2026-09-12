"use client";

import { useState } from "react";
import Link from "next/link";

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

export interface HistoryReportRow {
  id: string;
  business_type: string | null;
  trade: string | null;
  reporting_period: string | null;
  overall_assessment: string | null;
  created_at: string;
}

export default function HistoryList({ reports }: { reports: HistoryReportRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
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

      <ul className="divide-y divide-line rounded-lg border border-line bg-paper-raised">
        {reports.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-4">
            <input
              type="checkbox"
              checked={selected.includes(r.id)}
              onChange={() => toggle(r.id)}
              className="h-4 w-4 shrink-0 accent-ink"
              aria-label={`Select ${r.business_type ?? r.trade ?? "report"} from ${formatDate(r.created_at)} to compare`}
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

      {canCompare && (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper-raised px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <span className="text-sm text-ink-soft">2 reports selected</span>
            <Link
              href={compareHref}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              Compare
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
