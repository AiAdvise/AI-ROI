"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BrandMark from "@/components/BrandMark";
import GradientBlobs from "@/components/GradientBlobs";
import Reveal from "@/components/Reveal";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

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

        {status === "sent" ? (
          <div className="rounded-lg border border-good/20 bg-good-soft p-4 text-sm text-good">
            Check <span className="font-medium">{email}</span> for a sign-in link.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-2xl border border-line bg-paper-raised p-6 shadow-[0_1px_2px_rgba(28,36,52,0.04),0_12px_32px_rgba(28,36,52,0.06)]"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={status === "sending"}
              className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            />
            {error && <p className="text-sm text-severe">{error}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-[length:160%_100%] bg-[position:0%_0%] px-4 py-2.5 text-sm font-medium text-white shadow-md transition-[background-position,transform,box-shadow] duration-300 hover:bg-[position:100%_0%] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-[position:0%_0%]"
            >
              {status === "sending" ? "Sending link..." : "Send sign-in link"}
            </button>
          </form>
        )}
      </Reveal>
    </main>
  );
}
