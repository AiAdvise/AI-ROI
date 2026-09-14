"use client";

import { useRef, useState } from "react";

interface SalesUploadFormProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  disabled: boolean;
}

export default function SalesUploadForm({
  file,
  onFileChange,
  notes,
  onNotesChange,
  disabled,
}: SalesUploadFormProps) {
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
    onFileChange(f);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div
      className={`w-full rounded-2xl border border-line bg-paper-raised p-5 sm:p-6 shadow-[0_1px_2px_rgba(28,36,52,0.04),0_8px_24px_rgba(28,36,52,0.05)] ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
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
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          placeholder="e.g. &quot;This is just residential jobs, doesn't include commercial&quot;"
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-severe-soft px-3 py-2 text-sm text-severe">{error}</p>
      )}
    </div>
  );
}
