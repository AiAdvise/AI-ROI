"use client";

import { useState } from "react";

const QUESTIONS: { key: string; label: string }[] = [
  { key: "next_step", label: "What should I do first?" },
  { key: "overcharged", label: "Am I overpaying for this?" },
  { key: "proof_it_works", label: "Does this prove it's working?" },
];

export default function AskAboutReport({ reportId }: { reportId: string }) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [answer, setAnswer] = useState<{ question: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(key: string, label: string) {
    setLoadingKey(key);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionKey: key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't get an answer.");
      setAnswer({ question: label, text: data.answer });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't get an answer.");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="no-print card-lift rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-3">
        Ask about this report
      </h2>
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((q) => (
          <button
            key={q.key}
            onClick={() => ask(q.key, q.label)}
            disabled={loadingKey !== null}
            className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft transition-all hover:border-transparent hover:bg-gradient-to-r hover:from-brand-a hover:via-brand-b hover:to-brand-c hover:text-white hover:shadow-md disabled:opacity-50"
          >
            {loadingKey === q.key ? "Thinking…" : q.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-severe">{error}</p>}
      {answer && (
        <div className="mt-4 rounded-lg border border-accent/20 bg-accent-soft p-4">
          <p className="text-xs font-medium text-accent mb-1">{answer.question}</p>
          <p className="text-sm text-ink leading-relaxed">{answer.text}</p>
        </div>
      )}
    </div>
  );
}
