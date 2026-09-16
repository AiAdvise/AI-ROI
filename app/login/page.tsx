import BrandMark from "@/components/BrandMark";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";
import MagicLinkForm from "@/components/MagicLinkForm";

export default function LoginPage() {
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

        <MagicLinkForm
          submitLabel="Send sign-in link"
          sendingLabel="Sending link..."
          sentDescription="for a sign-in link"
        />
      </Reveal>
    </main>
  );
}
