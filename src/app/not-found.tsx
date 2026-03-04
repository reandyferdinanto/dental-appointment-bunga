import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--muted)] p-4">
      <div className="text-center">
        <div className="text-8xl mb-4">🦷</div>
        <h1 className="text-6xl font-extrabold text-[var(--foreground)] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak tersedia. Mungkin sudah dipindahkan
          atau alamat yang dimasukkan salah.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition-all"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/booking"
            className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold text-sm hover:bg-white transition-all"
          >
            Buat Janji Temu
          </Link>
        </div>
      </div>
    </div>
  );
}

