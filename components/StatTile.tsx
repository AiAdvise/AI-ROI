export default function StatTile({
  label,
  value,
  delta,
  deltaTone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string | null;
  deltaTone?: "good" | "severe" | "neutral";
}) {
  const toneClass =
    deltaTone === "good" ? "text-good" : deltaTone === "severe" ? "text-severe" : "text-ink-soft";

  return (
    <div className="card-lift rounded-xl border border-line bg-paper-raised p-5 shadow-sm">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-1.5 font-sans text-2xl font-semibold text-ink">{value}</p>
      {delta && <p className={`mt-1 text-xs font-medium ${toneClass}`}>{delta}</p>}
    </div>
  );
}
