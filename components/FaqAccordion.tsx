"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Will my agency or ad rep find out I'm doing this?",
    a: "No. There's no connection between this tool and your agency, station, or rep. Nothing you upload or any result you get is shared with them.",
  },
  {
    q: "What exactly do I need to upload?",
    a: "The media plan or ad report from your agency, station, or ad rep (PDF, spreadsheet, or similar), and an export from your CRM or job-tracking system showing job dates and values. Most owners can pull both in a few minutes.",
  },
  {
    q: "I don't know enough about marketing to push back on my agency or rep.",
    a: "You don't need to. Once you get your results, the tool drafts an email for you — built from your specific report — with the exact questions and suggestions to send to your ad rep. You can send it as-is or edit it first.",
  },
  {
    q: "Is my data safe?",
    a: "Your files are used only to generate your grade and analysis. You can delete your uploads and results from your account at any time.",
  },
  {
    q: "What happens after the 3 free months?",
    a: "You'll get a heads-up before your free period ends. If you'd like to continue, you're locked in at $15/mo for as long as you keep your account — a rate that won't be offered once this beta period is over. If not, you can walk away with no obligation.",
  },
  {
    q: "What kind of feedback are you looking for?",
    a: "Honest feedback — what was confusing, what was useful, whether the grade matched your gut sense of how your advertising is doing. A short form after you get your results.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-white/10">
      {FAQS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left font-[family-name:var(--font-heading)] text-lg font-semibold text-white"
            >
              {item.q}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4C3F91] to-[#B23E7E] text-lg leading-none text-white transition-transform duration-200 ${
                  open ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {open && <p className="max-w-2xl pb-5 text-[#C7D2DD]">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
