import Image from "next/image";
import Link from "next/link";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";
import GradeCardPreview from "@/components/GradeCardPreview";
import FaqAccordion from "@/components/FaqAccordion";
import SignupMagicLinkForm from "@/components/SignupMagicLinkForm";

const AGITATE_POINTS = [
  "The report you get every month is full of charts and impressions, but you still can't tell if last month's sales actually came from the ads.",
  "You've asked for straight numbers before and gotten a vague answer back, or none at all.",
  "You don't know if raising your budget would help — or just pad someone else's commission.",
  "Whoever's selling you the ads gets paid the same whether your phone rings more or not.",
];

const STEPS = [
  {
    title: "Upload your media plan",
    body: "The report your agency, station, or ad rep already sends you — whatever format it's in.",
  },
  {
    title: "Upload your sales data",
    body: "An export from your CRM or job-tracking software with dates and job values.",
  },
  {
    title: "Get your grade",
    body: "A plain-English breakdown of what's working, what isn't, and why.",
  },
];

const BENEFITS = [
  {
    title: "Graded against a real framework",
    body: "Your media plan isn't just eyeballed — it's scored against a structured media-buying framework, so the grade means something instead of being a gut reaction.",
  },
  {
    title: "Specific suggestions, not just a score",
    body: "You get concrete recommendations for what to change in your campaigns — channel mix, budget allocation, targeting — not just a number to worry about.",
  },
  {
    title: "A Trends report that tracks real growth",
    body: "See your sales data plotted against your campaign timeline, so you can tell whether growth is actually happening during the flight — not just whether your ad rep says it is.",
  },
  {
    title: "A one-click email to your ad rep",
    body: "Generate a draft email — built from your specific results — with the questions and suggestions to send straight to your ad rep. You don't have to know the right marketing language; it's already written for you.",
  },
];

const OFFER_TERMS = [
  "Full access, free for your first 3 months",
  "No credit card required to sign up",
  "After 3 months, locked in at $15/mo for as long as you stay",
  "That rate goes away once the beta ends — new users won't get it",
  "Cancel anytime, no obligation",
];

const TRUST_ITEMS = [
  {
    title: "Not shared with your ad rep",
    body: "Whoever sold you the ads never sees your upload or your results. This tool works for you, not for them.",
  },
  {
    title: "An early, honest beta",
    body: "This is a new tool from an independent builder, not an established company. We're upfront about that — and about the fact your feedback will directly shape what this becomes.",
  },
  {
    title: "You control your data",
    body: "Delete your uploaded files and results at any time from your account.",
  },
];

const GRADIENT_TEXT = "bg-gradient-to-br from-[#C99CE0] to-[#F2A9C9] bg-clip-text text-transparent";

const CTA_BUTTON_CLASSES =
  "whitespace-nowrap rounded-md bg-[#8B3FA8] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(139,63,168,0.35)] transition-colors hover:bg-[#6E2F87] disabled:opacity-50";

function trackCtaClick() {
  window.fbq?.("trackCustom", "ClickedSignupCTA");
}

export default function MarketingLandingPage() {
  return (
    <main className="relative overflow-hidden bg-[#14283D] font-[family-name:var(--font-body)] text-white">
      <GradientBlobs />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-8 xl:max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 40 40" className="h-7 w-7 flex-shrink-0" aria-hidden>
              <defs>
                <linearGradient id="navLogoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#4C3F91" />
                  <stop offset="1" stopColor="#B23E7E" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="20" fill="url(#navLogoGrad)" />
              <polyline
                points="7,21 13,21 16,13 21,29 24,17 27,21 33,21"
                fill="none"
                stroke="white"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight">
              Ad<span className={GRADIENT_TEXT}>Vitals</span>
            </span>
          </div>
          <Link
            href="/signup"
            onClick={trackCtaClick}
            className="rounded-md bg-[#8B3FA8] px-4 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(139,63,168,0.35)] transition-colors hover:bg-[#6E2F87]"
          >
            Get Early Access, Free
          </Link>
        </div>
      </div>

      <Reveal className="relative mx-auto grid max-w-6xl gap-12 px-4 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-16 xl:max-w-7xl">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Find out if your ad spend is <span className={GRADIENT_TEXT}>actually working</span>.
          </h1>
          <p className="mt-3 text-sm font-semibold text-[#C99CE0] lg:text-base">
            Independent. We&apos;re not an ad agency or media company, and we don&apos;t work for
            either.
          </p>
          <p className="mt-4 max-w-lg text-[#C7D2DD] lg:text-lg">
            Upload the ad report or media plan from your agency, TV/radio rep, or whoever handles
            your advertising, plus your sales or CRM export. We grade it against a real
            media-buying framework, show you whether sales are actually growing during the
            campaign, and hand you a ready-to-send email with the exact questions to ask.
          </p>
          <div className="mt-8 max-w-lg">
            <SignupMagicLinkForm
              submitLabel="Get Early Access, Free"
              sendingLabel="Sending..."
              buttonClassName={CTA_BUTTON_CLASSES}
            />
            <p className="mt-3 text-sm text-[#93A6B8]">Free for 3 months. No card required.</p>
          </div>
        </div>

        <GradeCardPreview />
      </Reveal>

      <Reveal className="relative mx-auto max-w-3xl px-4 py-14 sm:px-8">
        <p className="text-sm font-semibold text-[#C99CE0]">Sound familiar?</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold sm:text-3xl">
          Most home service owners spend real money on ads every month and have no honest way to
          answer one question: is it working?
        </h2>
        <ul className="mt-8 space-y-4">
          {AGITATE_POINTS.map((point) => (
            <li key={point} className="flex gap-3 text-[#C7D2DD]">
              <span className="mt-1 text-[#E0687A]">✕</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8 xl:max-w-7xl">
        <p className="text-sm font-semibold text-[#C99CE0]">How it works</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold sm:text-3xl">
          Ten minutes, two uploads, one honest answer.
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4C3F91] to-[#B23E7E] font-[family-name:var(--font-heading)] font-bold">
                {i + 1}
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-[#C7D2DD]">{step.body}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="border-y border-white/10 bg-white/[0.03]">
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8 xl:max-w-7xl">
          <p className="text-sm font-semibold text-[#C99CE0]">What you get</p>
          <div className="mt-8 divide-y divide-white/10">
            {BENEFITS.map((b) => (
              <div key={b.title} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr] sm:gap-8">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold">
                  {b.title}
                </h3>
                <p className="text-[#C7D2DD]">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8 xl:max-w-7xl">
        <div className="grid gap-10 rounded-2xl bg-gradient-to-br from-[#1F3B57] via-[#2A2559] to-[#4C2A52] p-8 shadow-[0_20px_50px_rgba(20,40,61,0.25)] sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold sm:text-3xl">
              Get early access, free
            </h2>
            <p className="mt-4 text-[#C7D2DD]">
              We&apos;re opening this up to a small first round of home service business owners
              before wider launch. In exchange for your honest feedback, you get in free and lock
              in a rate that won&apos;t be offered later.
            </p>
            <div className="mt-6 max-w-sm">
              <SignupMagicLinkForm
                submitLabel="Get Early Access, Free"
                sendingLabel="Sending..."
                buttonClassName={CTA_BUTTON_CLASSES}
              />
              <p className="mt-3 text-sm text-[#93A6B8]">
                Zero risk: free, no card, cancel anytime. The only thing you&apos;re spending is
                about 10 minutes.
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {OFFER_TERMS.map((term) => (
              <li key={term} className="flex gap-3 text-sm text-[#E4EAF0]">
                <span className="mt-0.5 text-[#C99CE0]">✓</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8 xl:max-w-7xl">
        <p className="text-sm font-semibold text-[#C99CE0]">Your data, handled carefully</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title}>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-[#C7D2DD]">{item.body}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="border-y border-white/10 bg-white/[0.03]">
        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-8">
          <div className="flex gap-5">
            <Image
              src="/founder.png"
              alt="Founder, AdVitals"
              width={56}
              height={56}
              className="h-14 w-14 flex-shrink-0 rounded-full bg-[#E4DCEF] object-cover"
            />
            <div>
              <p className="text-lg italic leading-relaxed text-white">
                &ldquo;I&apos;ve spent years on the media-buying side of this industry and kept
                seeing the same thing: owners getting a report full of charts with no real answer
                to &lsquo;is this working.&rsquo; I built AdVitals to give a straight answer, no
                matter whose numbers it is — yours or your ad rep&apos;s.&rdquo;
              </p>
              <p className="mt-3 text-sm text-[#93A6B8]">— Founder, AdVitals</p>
            </div>
          </div>
          <p className="mt-8 text-sm text-[#C7D2DD]">
            <strong className="text-white">
              We&apos;re onboarding our first round of beta testers right now.
            </strong>{" "}
            No manufactured reviews here — this section will fill up with real feedback from real
            owners as it comes in.
          </p>
        </div>
      </Reveal>

      <Reveal className="relative mx-auto max-w-4xl px-4 py-14 sm:px-8">
        <p className="text-sm font-semibold text-[#C99CE0]">Common questions</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold sm:text-3xl">
          Questions we get a lot
        </h2>
        <div className="mt-6">
          <FaqAccordion />
        </div>
      </Reveal>

      <Reveal className="border-t border-white/10">
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-14 text-left sm:px-8 xl:max-w-7xl">
          <h2 className="max-w-md font-[family-name:var(--font-heading)] text-2xl font-bold sm:text-3xl">
            Ready to find out where your ad dollars are actually going?
          </h2>
          <div className="w-full max-w-sm sm:w-auto">
            <SignupMagicLinkForm
              submitLabel="Get Early Access, Free"
              sendingLabel="Sending..."
              buttonClassName={CTA_BUTTON_CLASSES}
            />
          </div>
        </div>
      </Reveal>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-8 xl:max-w-7xl">
        <p className="text-sm text-[#93A6B8]">
          AdVitals is an early-stage, independent tool. Not affiliated with any advertising agency
          or media company.
        </p>
      </div>
    </main>
  );
}
