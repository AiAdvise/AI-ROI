"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface SignupMagicLinkFormProps {
  submitLabel: string;
  sendingLabel: string;
  buttonClassName?: string;
}

export default function SignupMagicLinkForm({
  submitLabel,
  sendingLabel,
  buttonClassName,
}: SignupMagicLinkFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) {
      setSubmitting(false);
      setError("Something went wrong getting you in. Please try again.");
      return;
    }

    // Best-effort: attach + confirm the email in the background so it
    // doesn't block getting the user into the app right away.
    supabase.auth.updateUser({ email }).catch(() => {});
    supabase.rpc("claim_signup_email", { p_email: email }).then(() => {});

    window.fbq?.("track", "Lead");
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@youragency.com"
        disabled={submitting}
        className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-[#93A6B8] outline-none focus:border-[#C99CE0] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={submitting}
        className={
          buttonClassName ??
          "w-full rounded-md bg-[#8B3FA8] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#6E2F87] disabled:opacity-50 sm:w-auto"
        }
      >
        {submitting ? sendingLabel : submitLabel}
      </button>
      {error && <p className="text-sm text-[#F0A8C8] sm:basis-full">{error}</p>}
    </form>
  );
}
