"use client";

import { useRef, useState } from "react";

const TRADES = ["HVAC", "Plumbing", "Roofing", "Siding & Windows", "Electrical", "Other"];

interface UploadFormProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  trade: string;
  onTradeChange: (trade: string) => void;
  spendNotes: string;
  onSpendNotesChange: (notes: string) => void;
  disabled: boolean;
}

export default function UploadForm({
  file,
  onFileChange,
  trade,
  onTradeChange,
  spendNotes,
  onSpendNotesChange,
  disabled,
}: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

  function handleFile(f: File | undefined | null) {
    if (!f) return;
    if (!acceptedTypes.includes(f.type)) {
      setError("Please upload a PDF, PNG, JPEG, or WEBP file.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File is too large. Max size is 20MB.");
      return;
    }
    setError(null);
    onFileChange(f);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div
      className={`w-full max-w-xl mx-auto rounded-2xl border border-line bg-paper-raised p-6 sm:p-8 shadow-[0_1px_2px_rgba(28,36,52,0.04),0_8px_24px_rgba(28,36,52,0.05)] ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging ? "border-accent bg-accent-soft" : "border-line bg-paper hover:border-ink-soft/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {file ? (
          <div>
            <p className="font-medium text-ink">{file.name}</p>
            <p className="text-sm text-ink-soft mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB - click to choose a different file
            </p>
          </div>
        ) : (
          <div>
            <p className="font-medium text-ink">
              Drag and drop your agency&apos;s report or media plan
            </p>
            <p className="text-sm text-ink-soft mt-1">
              or click to browse - PDF, PNG, JPEG, or WEBP
            </p>
          </div>
        )}
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-ink mb-1.5">
          Your trade{" "}
          <span className="font-normal text-ink-soft">
            (optional - helps with benchmark accuracy)
          </span>
        </label>
        <select
          value={trade}
          onChange={(e) => onTradeChange(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">Select a trade...</option>
          {TRADES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-ink mb-1.5">
          What did you actually spend?{" "}
          <span className="font-normal text-ink-soft">
            (optional - most agency reports leave this out)
          </span>
        </label>
        <textarea
          value={spendNotes}
          onChange={(e) => onSpendNotesChange(e.target.value)}
          rows={2}
          placeholder="e.g. &quot;$2,400 total&quot; or, if you know the breakdown, &quot;CTV: $1,500, SEM: $600, Pre-Roll: $300&quot;"
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Enter whatever precision you actually have - a single total is fine. We&apos;ll only
          calculate what the numbers you give us support, never guess a per-channel split.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-severe-soft px-3 py-2 text-sm text-severe">{error}</p>
      )}
    </div>
  );
}
