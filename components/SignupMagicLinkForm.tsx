"use client";

import MagicLinkForm from "@/components/MagicLinkForm";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface SignupMagicLinkFormProps {
  submitLabel: string;
  sendingLabel: string;
  sentDescription: string;
  buttonClassName?: string;
}

export default function SignupMagicLinkForm(props: SignupMagicLinkFormProps) {
  return (
    <MagicLinkForm
      {...props}
      onSuccess={() => {
        window.fbq?.("track", "Lead");
      }}
    />
  );
}
