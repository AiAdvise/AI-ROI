// Purely decorative per-tile identity color (top border) so a row of tiles
// doesn't read as one uniform white block - never used to signal status.
const ACCENT_BORDER: Record<"a" | "b" | "c", string> = {
  a: "border-t-brand-a",
  b: "border-t-brand-b",
  c: "border-t-brand-c",
};

export default function StatTile({
  label,
  value,
  delta,
  deltaTone = "neutral",
  accent,
}: {
  label: string;
  value: string;
  delta?: string | null;
  deltaTone?: "good" | "severe" | "neutral";
  accent?: "a" | "b" | "c";
}) {
  const toneClass =
    deltaTone === "good" ? "text-good" : deltaTone === "severe" ? "text-severe" : "text-ink-soft";

  return (
    <div
      className={`card-lift rounded-xl border border-line bg-paper-raised p-5 shadow-sm print:border-t-line ${
        accent ? `border-t-4 ${ACCENT_BORDER[accent]}` : ""
      }`}
    >
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-1.5 font-sans text-2xl font-semibold text-ink">{value}</p>
      {delta && <p className={`mt-1 text-xs font-medium ${toneClass}`}>{delta}</p>}
    </div>
  );
}
