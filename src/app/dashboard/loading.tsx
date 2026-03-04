export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)] animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--muted-foreground)]">Memuat dashboard...</p>
      </div>
    </div>
  );
}

