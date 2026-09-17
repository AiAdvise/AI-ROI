export default function GradeCardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="relative bg-gradient-to-br from-[#4C3F91] to-[#B23E7E] px-6 pb-7 pt-5 text-white">
        <div className="flex items-start justify-between">
          <p className="text-xs tracking-wide text-[#E4D9EE]">Diagnostic summary</p>
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs">Some concerns</span>
        </div>
        <p className="mt-1 font-[family-name:var(--font-heading)] text-xl font-bold">Roofing (Sample)</p>
        <div className="absolute right-6 top-14 flex h-9 w-9 items-center justify-center rounded-full bg-[#3f6b4a] font-[family-name:var(--font-heading)] text-lg font-bold">
          B
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-4 text-sm text-[#EDE3F3]">
          <li>$5,393 spent across 4 channels — CTV/OTT got the largest share (35%) but drove $0 in traced sales.</li>
          <li>Search converted at 3x the rate of paid social this month.</li>
        </ul>
      </div>

      <div className="px-6 pb-6 pt-5">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-md border border-[#DAD5C9] border-t-[3px] border-t-[#4C3F91] px-3 py-2.5">
            <p className="text-[0.7rem] text-[#4B5158]">Return on ad spend</p>
            <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-bold text-[#1D2126]">3.4x</p>
            <p className="mt-0.5 text-[0.68rem] text-[#4B5158]">$3.40 back per $1 spent</p>
          </div>
          <div className="rounded-md border border-[#DAD5C9] border-t-[3px] border-t-[#B23E7E] px-3 py-2.5">
            <p className="text-[0.7rem] text-[#4B5158]">Health score</p>
            <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-bold text-[#1D2126]">78/100</p>
            <p className="mt-0.5 text-[0.68rem] text-[#4B5158]">Roofing avg: 64</p>
          </div>
          <div className="rounded-md border border-[#DAD5C9] border-t-[3px] border-t-[#8B3FA8] px-3 py-2.5">
            <p className="text-[0.7rem] text-[#4B5158]">Cost per job</p>
            <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-bold text-[#1D2126]">$490</p>
            <p className="mt-0.5 text-[0.68rem] text-[#4B5158]">Roofing avg: $610</p>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-[#DAD5C9] px-3.5 pb-2.5 pt-3.5">
          <p className="mb-2.5 text-[0.72rem] text-[#4B5158]">Revenue vs. ad spend, by month</p>
          <svg viewBox="0 0 300 90" className="block h-[70px] w-full overflow-visible" preserveAspectRatio="none" aria-hidden>
            <rect x="8" y="49" width="30" height="41" rx="2" fill="#3E9BB0" />
            <rect x="66" y="39" width="30" height="51" rx="2" fill="#3E9BB0" />
            <rect x="124" y="44" width="30" height="46" rx="2" fill="#3E9BB0" />
            <rect x="182" y="19" width="30" height="71" rx="2" fill="#3E9BB0" />
            <rect x="240" y="4" width="30" height="86" rx="2" fill="#3E9BB0" />
            <polyline
              points="23,52 81,49 139,54 197,47 255,50"
              fill="none"
              stroke="#8B3FA8"
              strokeWidth="2"
            />
            <circle cx="23" cy="52" r="3" fill="#8B3FA8" />
            <circle cx="81" cy="49" r="3" fill="#8B3FA8" />
            <circle cx="139" cy="54" r="3" fill="#8B3FA8" />
            <circle cx="197" cy="47" r="3" fill="#8B3FA8" />
            <circle cx="255" cy="50" r="3" fill="#8B3FA8" />
          </svg>
          <div className="mt-2.5 flex items-center gap-1.5 text-[0.72rem] text-[#4B5158]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#3E9BB0]" /> Revenue
            <span className="ml-2.5 h-2.5 w-2.5 rounded-full bg-[#8B3FA8]" /> Ad spend
          </div>
        </div>

        <div className="mt-3.5 rounded-md bg-[#EAF4EE] px-3.5 py-2.5 text-sm text-[#2F6146]">
          <strong>Search converted 3x better than paid social</strong> — but CTV/OTT still got 35%
          of the budget with $0 in traced sales.
        </div>
      </div>
    </div>
  );
}
