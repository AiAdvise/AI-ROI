"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AnonymousAccountBannerProps {
  email: string | null;
}

export default function AnonymousAccountBanner({ email }: AnonymousAccountBannerProps) {
  const [inputEmail, setInputEmail] = useState(email ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputEmail) return;
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser(
      { email: inputEmail },
      { emailRedirectTo: `${window.location.origin}/auth/callback` }
    );
    if (error) {
      setStatus("error");
      return;
    }

    if (inputEmail !== email) {
      supabase.rpc("claim_signup_email", { p_email: inputEmail }).then(() => {});
    }
    setStatus("sent");
  }

  return (
    <div className="no-print border-b border-accent/20 bg-accent-soft px-4 py-3 text-sm text-ink">
      <div className="max-w-4xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {email ? (
            <>
              Confirm your email so you can log back in next month — we sent a link to{" "}
              <span className="font-medium">{email}</span>.
            </>
          ) : (
            "Confirm your email so you can log back in next month."
          )}
        </p>

        {status === "sent" ? (
          <p className="text-xs font-medium text-accent">Sent! Check your inbox.</p>
        ) : (
          <form onSubmit={resend} className="flex items-center gap-2">
            {!email && (
              <input
                type="email"
                required
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="you@youragency.com"
                className="rounded-md border border-line bg-paper px-2 py-1 text-xs"
              />
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="whitespace-nowrap text-xs font-medium underline underline-offset-4 hover:text-accent disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : email ? "Resend link" : "Send link"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-xs text-severe">Something went wrong. Try again.</p>
        )}
      </div>
    </div>
  );
}
