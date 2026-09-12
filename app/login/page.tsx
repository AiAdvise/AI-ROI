"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
            Media Plan Diagnostic
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Sign in with your email to run diagnostics and keep your report history.
          </p>
        </div>

        {status === "sent" ? (
          <div className="rounded-lg border border-good/20 bg-good-soft p-4 text-sm text-good">
            Check <span className="font-medium">{email}</span> for a sign-in link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
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
              className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending link..." : "Send sign-in link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
