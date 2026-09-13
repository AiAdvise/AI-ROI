"use client";

import { useRef, useState } from "react";

interface SalesUploadFormProps {
  onSubmit: (file: File, notes: string | null) => void;
  disabled: boolean;
}

export default function SalesUploadForm({ onSubmit, disabled }: SalesUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "text/csv",
    "application/vnd.ms-excel",
  ];

  function handleFile(f: File | undefined | null) {
    if (!f) return;
    const isCsvByExtension = f.name.toLowerCase().endsWith(".csv");
    if (!acceptedTypes.includes(f.type) && !isCsvByExtension) {
      setError("Please upload a PDF, PNG, JPEG, WEBP, or CSV file.");
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
      setError("Please select a file to upload.");
      return;
    }
    onSubmit(file, notes.trim() || null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto rounded-2xl border border-line bg-paper-raised p-6 sm:p-8 shadow-[0_1px_2px_rgba(28,36,52,0.04),0_8px_24px_rgba(28,36,52,0.05)]"
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
            <p className="font-medium text-ink">Drag and drop a sales/CRM export</p>
            <p className="text-sm text-ink-soft mt-1">
              or click to browse - PDF, PNG, JPEG, WEBP, or CSV
            </p>
          </div>
        )}
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-ink mb-1.5">
          Anything we should know?{" "}
          <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="e.g. &quot;This is just residential jobs, doesn't include commercial&quot;"
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-severe-soft px-3 py-2 text-sm text-severe">{error}</p>
      )}

      <button
        type="submit"
        disabled={disabled || !file}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-[length:160%_100%] bg-[position:0%_0%] px-4 py-3 font-medium text-white shadow-md transition-[background-position,transform,box-shadow] duration-300 hover:bg-[position:100%_0%] hover:shadow-lg active:scale-[0.99] disabled:opacity-40 disabled:hover:bg-[position:0%_0%] disabled:hover:shadow-md"
      >
        {disabled ? "Extracting..." : "Track this month's sales"}
      </button>
    </form>
  );
}
