import { createClient } from "@/lib/supabase/server";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";
import MagicLinkForm from "@/components/MagicLinkForm";
import GradeCardPreview from "@/components/GradeCardPreview";

const FOUNDING_PRICE_SPOTS = 10;

const OFFER_POINTS = [
  "Full access, free for your first 3 months",
  "No credit card required to sign up",
  "After 3 months, locked in at $15/mo for as long as you stay",
  "That rate goes away once the beta ends — new users won't get it",
  "Cancel anytime, no obligation",
];

const MARKETING_BUTTON_CLASSES =
  "w-full rounded-md bg-[#8B3FA8] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(139,63,168,0.35)] transition-colors hover:bg-[#6E2F87] disabled:opacity-50";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: spotsTaken } = await supabase.rpc("beta_spots_taken");
  const spotsLeft = Math.max(0, FOUNDING_PRICE_SPOTS - (spotsTaken ?? 0));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#14283D] px-4 py-10 font-[family-name:var(--font-body)] text-white sm:px-8 sm:py-14 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-16 lg:py-20">
      <GradientBlobs />

      <div className="relative mx-auto w-full max-w-6xl xl:max-w-7xl">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 40 40" className="h-7 w-7 flex-shrink-0 lg:h-9 lg:w-9" aria-hidden>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#4C3F91" />
                <stop offset="1" stopColor="#B23E7E" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
            <polyline
              points="7,21 13,21 16,13 21,29 24,17 27,21 33,21"
              fill="none"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight lg:text-xl">
            Ad
            <span className="bg-gradient-to-br from-[#C99CE0] to-[#F2A9C9] bg-clip-text text-transparent">
              Vitals
            </span>
          </span>
        </div>

        <Reveal className="mt-10 grid gap-12 lg:mt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-20 xl:gap-24">
          <div>
            <p className="text-sm font-semibold text-[#C99CE0] lg:text-base">
              Independent. We&apos;re not an ad agency or media company, and we don&apos;t work
              for either.
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
              Find out if your ad spend is{" "}
              <span className="bg-gradient-to-br from-[#C99CE0] to-[#F2A9C9] bg-clip-text text-transparent">
                actually working
              </span>
              .
            </h1>
            <p className="mt-4 max-w-md text-[#C7D2DD] lg:max-w-lg lg:text-lg">
              Upload your media plan and your sales data. Get a graded diagnostic, a Trends
              report that tracks real growth, and a ready-to-send email to your ad rep — no
              marketing background required.
            </p>

            <ul className="mt-8 space-y-3 lg:space-y-4">
              {OFFER_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-[#E4EAF0] lg:text-base">
                  <span className="mt-0.5 text-[#C99CE0]">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm text-[#93A6B8] lg:text-base">
              Zero risk: free, no card, cancel anytime. The only thing you&apos;re spending is
              about 10 minutes.
            </p>
          </div>

          <div>
            <GradeCardPreview />

            <div className="mt-6">
              {spotsLeft > 0 ? (
                <p className="mb-3 text-sm font-semibold text-[#F0A8C8] lg:text-base">
                  {spotsLeft} of {FOUNDING_PRICE_SPOTS} early access spots left at that price.
                </p>
              ) : (
                <p className="mb-3 text-sm font-semibold text-[#C7D2DD] lg:text-base">
                  Early access pricing is claimed — join the beta below and we&apos;ll follow up
                  on pricing.
                </p>
              )}

              <MagicLinkForm
                submitLabel="Get Early Access, Free"
                sendingLabel="Sending link..."
                sentDescription="for your beta access link"
                buttonClassName={MARKETING_BUTTON_CLASSES}
              />

              <p className="mt-4 text-center text-xs text-[#93A6B8]">
                Not shared with your ad rep — this tool works for you, not for them.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
