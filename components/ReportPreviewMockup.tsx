// A purely decorative, hard-coded stand-in for what a finished report looks
// like - never real data, never rendered from live state. Exists only to
// give the hero section a "product screenshot" visual on the side that
// isn't carrying the upload form, tilted for a less static, more dynamic
// feel than a flat rectangle would give.
export default function ReportPreviewMockup() {
  return (
    <div aria-hidden className="relative mx-auto max-w-sm select-none">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-a/20 via-brand-b/20 to-brand-c/20 blur-2xl" />

      <div className="absolute inset-0 rotate-6 rounded-2xl border-2 border-brand-a/20 bg-paper-raised shadow-lg" />

      <div className="relative -rotate-2 hover:rotate-0 transition-transform duration-500 rounded-2xl border-2 border-brand-b/30 bg-paper-raised shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-ink via-[#2a1f3d] to-[#4a1730] px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
            Diagnostic Summary
          </p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="font-serif text-lg font-semibold text-white">Roofing (Sample)</p>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-good font-serif text-sm font-bold text-white">
              B
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-white/20" />
            <div className="h-1.5 w-4/5 rounded-full bg-white/20" />
            <div className="h-1.5 w-3/5 rounded-full bg-white/20" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-4">
          <div className="rounded-lg border-t-4 border-t-brand-a bg-paper p-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded bg-ink-soft/20" />
            <div className="h-2.5 w-1/2 rounded bg-ink/30" />
          </div>
          <div className="rounded-lg border-t-4 border-t-brand-b bg-paper p-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded bg-ink-soft/20" />
            <div className="h-2.5 w-1/2 rounded bg-ink/30" />
          </div>
          <div className="rounded-lg border-t-4 border-t-brand-c bg-paper p-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded bg-ink-soft/20" />
            <div className="h-2.5 w-1/2 rounded bg-ink/30" />
          </div>
        </div>

        <div className="px-4 pb-5">
          <div className="rounded-xl border border-line bg-paper p-3">
            <div className="flex h-14 items-end gap-1.5">
              <div className="flex-1 rounded-t bg-[#1f5f9e]" style={{ height: "40%" }} />
              <div className="flex-1 rounded-t bg-[#1f5f9e]" style={{ height: "65%" }} />
              <div className="flex-1 rounded-t bg-[#1f5f9e]" style={{ height: "50%" }} />
              <div className="flex-1 rounded-t bg-[#1f5f9e]" style={{ height: "85%" }} />
              <div className="flex-1 rounded-t bg-[#1f5f9e]" style={{ height: "70%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
