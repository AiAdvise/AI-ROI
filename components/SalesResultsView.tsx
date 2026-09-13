import type { SalesDataResult } from "@/lib/types";
import Reveal from "@/components/Reveal";
import StatTile from "@/components/StatTile";

export default function SalesResultsView({ result }: { result: SalesDataResult }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#2a1f3d] to-[#4a1730] px-6 py-8 sm:px-10 sm:py-10 shadow-xl print:bg-white print:border print:border-line print:shadow-none">
          <div
            aria-hidden
            className="no-print pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-brand-b/30 blur-3xl animate-floatBlob"
          />
          <p className="relative text-xs font-semibold uppercase tracking-widest text-white/50 print:text-ink-soft">
            Sales Snapshot
          </p>
          <h1 className="relative mt-2 font-serif text-2xl sm:text-3xl font-semibold text-white print:text-ink">
            {result.reportingPeriod ?? "Sales data"}
          </h1>
          {result.notes && (
            <p className="relative mt-4 text-white/85 leading-relaxed print:text-ink">
              {result.notes}
            </p>
          )}
        </div>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Reveal delay={0}>
          <StatTile
            accent="a"
            label="Total revenue"
            value={result.totalRevenue ?? "—"}
          />
        </Reveal>
        <Reveal delay={80}>
          <StatTile
            accent="b"
            label="Sales / jobs closed"
            value={result.dealCount ?? "—"}
          />
        </Reveal>
        <Reveal delay={160}>
          <StatTile
            accent="c"
            label="Average sale size"
            value={result.avgDealSize ?? "—"}
          />
        </Reveal>
      </div>
    </div>
  );
}
