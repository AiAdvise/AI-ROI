"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

interface MagicLinkFormProps {
  submitLabel: string;
  sendingLabel: string;
  sentDescription: string;
  buttonClassName?: string;
  onSuccess?: () => void;
}

export default function MagicLinkForm({
  submitLabel,
  sendingLabel,
  sentDescription,
  buttonClassName,
  onSuccess,
}: MagicLinkFormProps) {
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
    onSuccess?.();
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-good/20 bg-good-soft p-4 text-sm text-good">
        Check <span className="font-medium">{email}</span> {sentDescription}.
      </div>
    );
  }

  return (
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
        className={
          buttonClassName ??
          "w-full rounded-lg bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-[length:160%_100%] bg-[position:0%_0%] px-4 py-2.5 text-sm font-medium text-white shadow-md transition-[background-position,transform,box-shadow] duration-300 hover:bg-[position:100%_0%] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-[position:0%_0%]"
        }
      >
        {status === "sending" ? sendingLabel : submitLabel}
      </button>
    </form>
  );
}
