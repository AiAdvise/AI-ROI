export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`gradient-text font-serif font-semibold tracking-tight ${className}`}>
      Media Plan Diagnostic
    </span>
  );
}
