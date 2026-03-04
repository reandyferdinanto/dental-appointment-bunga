export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)] animate-spin mx-auto mb-4" />
        <p className="text-sm text-[var(--muted-foreground)]">Memuat...</p>
      </div>
    </div>
  );
}

