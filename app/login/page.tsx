import BrandMark from "@/components/BrandMark";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";
import MagicLinkForm from "@/components/MagicLinkForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const { error, reason } = await searchParams;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <GradientBlobs />
      <Reveal className="w-full max-w-sm">
        <div className="text-center mb-8">
          <BrandMark className="text-2xl" />
          <p className="mt-2 text-sm text-ink-soft">
            Sign in with your email to run diagnostics and keep your report history.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-severe-soft px-3 py-2 text-center text-sm text-severe">
            That confirmation link didn&apos;t go through
            {reason ? ` (${reason})` : ""}. Request a fresh one below.
          </p>
        )}

        <MagicLinkForm
          submitLabel="Send sign-in link"
          sendingLabel="Sending link..."
          sentDescription="for a sign-in link"
        />
      </Reveal>
    </main>
  );
}
