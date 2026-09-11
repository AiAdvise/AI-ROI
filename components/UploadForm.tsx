"use client";

import { useRef, useState } from "react";

const TRADES = ["HVAC", "Plumbing", "Roofing", "Electrical", "Other"];

interface UploadFormProps {
  onSubmit: (file: File, trade: string | null, spendNotes: string | null) => void;
  disabled: boolean;
}

export default function UploadForm({ onSubmit, disabled }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [trade, setTrade] = useState<string>("");
  const [spendNotes, setSpendNotes] = useState<string>("");
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
    setFile(f);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to analyze.");
      return;
    }
    onSubmit(file, trade || null, spendNotes.trim() || null);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging ? "border-ink bg-white" : "border-gray-300 bg-white/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {file ? (
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB - click to choose a different file
            </p>
          </div>
        ) : (
          <div>
            <p className="font-medium">Drag and drop your agency&apos;s report or media plan</p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse - PDF, PNG, JPEG, or WEBP
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your trade (optional - helps with benchmark accuracy)
        </label>
        <select
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select a trade...</option>
          {TRADES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What did you actually spend? (optional - most agency reports leave this out)
        </label>
        <textarea
          value={spendNotes}
          onChange={(e) => setSpendNotes(e.target.value)}
          rows={2}
          placeholder="e.g. &quot;$2,400 total&quot; or, if you know the breakdown, &quot;CTV: $1,500, SEM: $600, Pre-Roll: $300&quot;"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter whatever precision you actually have - a single total is fine. We&apos;ll only
          calculate what the numbers you give us support, never guess a per-channel split.
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={disabled || !file}
        className="mt-5 w-full rounded-md bg-ink px-4 py-3 font-medium text-white transition-opacity disabled:opacity-40"
      >
        {disabled ? "Analyzing..." : "Diagnose my report"}
      </button>
    </form>
  );
}
