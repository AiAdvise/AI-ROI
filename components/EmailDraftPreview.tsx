const EMAIL_SUBJECT = "Questions about our Plumbing report (November 1 - November 30, 2025)";

const EMAIL_BODY = `Hi,

I went through our latest report and had a few questions before our next call:

1. The Pre-Roll completion rate is 29.69%, well under the 50-70% typical range - was this inventory supposed to be non-skippable, and what's driving the drop-off?
2. Neither the Pre-Roll nor CTV/OTT sections show frequency data - what's the average frequency for each, and is it healthy for a one-month campaign?
3. Can you provide the actual dollar spend by channel so cost-per-click and cost-per-call can be compared to industry benchmarks?

Thanks,`;

export default function EmailDraftPreview() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
        Draft an email to your agency
      </h3>

      <div className="mt-4">
        <p className="mb-1 text-xs font-medium text-ink-soft">Subject</p>
        <p className="mb-3 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink">
          {EMAIL_SUBJECT}
        </p>
        <p className="mb-1 text-xs font-medium text-ink-soft">Body</p>
        <div className="whitespace-pre-line rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink">
          {EMAIL_BODY}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-gradient-to-r from-brand-a via-brand-b to-brand-c px-4 py-1.5 text-sm font-medium text-white shadow-sm">
            Copy to clipboard
          </span>
          <span className="text-sm font-medium text-ink-soft underline underline-offset-4">
            Open in email app
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-soft/70">
        Auto-written from your specific results — yours will reference your own numbers.
      </p>
    </div>
  );
}
