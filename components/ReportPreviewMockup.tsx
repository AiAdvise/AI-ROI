// A purely decorative, hard-coded stand-in for what a finished report looks
// like - never real data, never rendered from live state. The figures below
// are illustrative sample numbers only, chosen to look like a real
// diagnostic + sales snapshot rather than abstract placeholder bars. Exists
// only to give the hero section a "product screenshot" visual on the side
// that isn't carrying the upload form, tilted for a less static, more
// dynamic feel than a flat rectangle would give.
export default function ReportPreviewMockup() {
  return (
    <div aria-hidden className="relative mx-auto max-w-md select-none">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-brand-a/20 via-brand-b/20 to-brand-c/20 blur-3xl" />

      <div className="absolute inset-0 rotate-6 rounded-2xl border-2 border-brand-a/20 bg-paper-raised shadow-lg" />

      <div className="relative -rotate-2 hover:rotate-0 transition-transform duration-500 rounded-2xl border-2 border-brand-b/30 bg-paper-raised shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-ink via-[#2a1f3d] to-[#4a1730] px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
              Diagnostic Summary
            </p>
            <span className="rounded-full bg-caution-soft px-2 py-0.5 text-[10px] font-semibold text-caution">
              Some concerns
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="font-serif text-xl font-semibold text-white">Roofing (Sample)</p>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-good font-serif text-base font-bold text-white shadow-md">
              B
            </div>
          </div>

          <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-white/50">
            Key Takeaways
          </p>
          <ul className="mt-1.5 space-y-1.5">
            <li className="flex gap-1.5 text-xs leading-snug text-white/85">
              <span className="text-white/40">&bull;</span>
              $5,393 spent across 4 channels - CTV/OTT got the largest share (35%).
            </li>
            <li className="flex gap-1.5 text-xs leading-snug text-white/85">
              <span className="text-white/40">&bull;</span>
              Search click-to-call rate is well below the roofing benchmark.
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-2 p-4">
          <div className="rounded-lg border-t-4 border-t-brand-a bg-paper p-2.5">
            <p className="text-[9px] font-medium uppercase tracking-wide text-ink-soft">
              Total Spend
            </p>
            <p className="mt-1 font-sans text-sm font-semibold text-ink">$5,393</p>
          </div>
          <div className="rounded-lg border-t-4 border-t-brand-b bg-paper p-2.5">
            <p className="text-[9px] font-medium uppercase tracking-wide text-ink-soft">
              Health Score
            </p>
            <p className="mt-1 font-sans text-sm font-semibold text-ink">78/100</p>
          </div>
          <div className="rounded-lg border-t-4 border-t-brand-c bg-paper p-2.5">
            <p className="text-[9px] font-medium uppercase tracking-wide text-ink-soft">
              Revenue
            </p>
            <p className="mt-1 font-sans text-sm font-semibold text-ink">$45,557</p>
          </div>
        </div>

        <div className="px-4">
          <div className="rounded-xl border border-line bg-paper p-3">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-soft mb-2">
              Revenue over time
            </p>
            <div className="flex h-14 items-end gap-1.5">
              <div className="flex-1 rounded-t bg-[#0891b2]" style={{ height: "45%" }} />
              <div className="flex-1 rounded-t bg-[#0891b2]" style={{ height: "60%" }} />
              <div className="flex-1 rounded-t bg-[#0891b2]" style={{ height: "55%" }} />
              <div className="flex-1 rounded-t bg-[#0891b2]" style={{ height: "80%" }} />
              <div className="flex-1 rounded-t bg-[#0891b2]" style={{ height: "100%" }} />
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-lg border border-good/20 bg-good-soft px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-good">
              New business this month
            </p>
            <p className="mt-0.5 text-xs font-medium text-ink">
              +4 sales &bull; revenue up $4,142 since last month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
