import { createClient } from "@/lib/supabase/server";
import BrandMark from "@/components/BrandMark";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";
import MagicLinkForm from "@/components/MagicLinkForm";

const FOUNDING_PRICE_SPOTS = 10;

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: spotsTaken } = await supabase.rpc("beta_spots_taken");
  const spotsLeft = Math.max(0, FOUNDING_PRICE_SPOTS - (spotsTaken ?? 0));

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <GradientBlobs />
      <Reveal className="w-full max-w-sm">
        <div className="text-center mb-8">
          <BrandMark className="text-2xl" />
          <p className="mt-3 text-sm text-ink-soft">
            3 months free, no credit card. Lock in <span className="font-medium text-ink">$15/mo for life</span>{" "}
            as a founding beta tester.
          </p>
          {spotsLeft > 0 ? (
            <p className="mt-2 text-xs font-medium text-accent">
              {spotsLeft} of {FOUNDING_PRICE_SPOTS} founding spots left at that price.
            </p>
          ) : (
            <p className="mt-2 text-xs font-medium text-ink-soft">
              Founding pricing is claimed — join the beta below and we&apos;ll follow up on pricing.
            </p>
          )}
        </div>

        <MagicLinkForm
          submitLabel="Start my free trial"
          sendingLabel="Sending link..."
          sentDescription="for your beta access link"
        />
      </Reveal>
    </main>
  );
}
