"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";

function buildEmail(result: AnalysisResult): { subject: string; body: string } {
  const { documentSummary } = result;
  const subject = `Questions about our ${documentSummary.businessType ?? "media plan"} report${
    documentSummary.reportingPeriod ? ` (${documentSummary.reportingPeriod})` : ""
  }`;

  const flagLines = result.redFlags
    .filter((f) => f.severity !== "low")
    .slice(0, 4)
    .map((f) => `- ${f.title}`)
    .join("\n");

  const questionLines = result.questionsToAsk
    .slice(0, 5)
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n");

  const body = [
    "Hi,",
    "",
    "I went through our latest report and had a few questions before our next call:",
    "",
    questionLines || "1. Can you walk me through how these results compare to what's typical for our budget?",
    ...(flagLines
      ? ["", "A couple of specific things I noticed in the report:", flagLines]
      : []),
    "",
    "Thanks,",
  ].join("\n");

  return { subject, body };
}

export default function EmailDraft({ result }: { result: AnalysisResult }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { subject, body } = buildEmail(result);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="no-print rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
          Draft an email to your agency
        </h2>
        <span className="text-ink-soft text-sm">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="mt-4">
          <p className="text-xs font-medium text-ink-soft mb-1">Subject</p>
          <p className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink mb-3">{subject}</p>
          <p className="text-xs font-medium text-ink-soft mb-1">Body</p>
          <textarea
            readOnly
            value={body}
            rows={Math.min(14, body.split("\n").length + 1)}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink leading-relaxed"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={copy}
              className="rounded-full bg-gradient-to-r from-brand-a via-brand-b to-brand-c px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md"
            >
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
            <a
              href={mailtoHref}
              className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Open in email app
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
