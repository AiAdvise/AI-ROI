import { createClient } from "@/lib/supabase/server";
import BrandMark from "@/components/BrandMark";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";
import MagicLinkForm from "@/components/MagicLinkForm";

const FOUNDING_PRICE_SPOTS = 10;

const OFFER_POINTS = [
  "Full access, free for your first 3 months",
  "No credit card required to sign up",
  "After 3 months, locked in at $15/mo for as long as you stay",
  "Cancel anytime — no obligation",
];

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: spotsTaken } = await supabase.rpc("beta_spots_taken");
  const spotsLeft = Math.max(0, FOUNDING_PRICE_SPOTS - (spotsTaken ?? 0));

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <GradientBlobs />
      <Reveal className="w-full max-w-md">
        <div className="text-center mb-6">
          <BrandMark className="text-2xl" />
          <h1 className="mt-4 text-xl font-serif font-semibold text-ink">
            Find out if your ad spend is actually working.
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Upload your media plan and sales data. Get a graded diagnostic, a Trends report, and a
            ready-to-send email to your ad rep — no marketing background required.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-line bg-paper-raised p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Founding beta offer
          </p>
          <ul className="mt-3 space-y-2">
            {OFFER_POINTS.map((point) => (
              <li key={point} className="flex gap-2 text-sm text-ink">
                <span className="text-good">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {spotsLeft > 0 ? (
            <p className="mt-3 text-xs font-medium text-accent">
              {spotsLeft} of {FOUNDING_PRICE_SPOTS} founding spots left at that price.
            </p>
          ) : (
            <p className="mt-3 text-xs font-medium text-ink-soft">
              Founding pricing is claimed — join the beta below and we&apos;ll follow up on pricing.
            </p>
          )}
        </div>

        <MagicLinkForm
          submitLabel="Start my free trial"
          sendingLabel="Sending link..."
          sentDescription="for your beta access link"
        />

        <p className="mt-4 text-center text-xs text-ink-soft">
          Not shared with your ad rep — this tool works for you, not for them.
        </p>
      </Reveal>
    </main>
  );
}
