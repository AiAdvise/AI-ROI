export default function GradientBlobs() {
  return (
    <div
      aria-hidden
      className="no-print pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-a/25 blur-3xl animate-floatBlob" />
      <div className="absolute -top-10 right-0 h-80 w-80 rounded-full bg-brand-c/20 blur-3xl animate-floatBlobSlow" />
      <div className="absolute top-40 left-1/3 h-64 w-64 rounded-full bg-brand-b/15 blur-3xl animate-floatBlob" />
    </div>
  );
}
