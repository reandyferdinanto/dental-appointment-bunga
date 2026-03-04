"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs */}
      <div className="blob-pink absolute w-72 h-72 -top-20 -left-20 pointer-events-none" />
      <div className="blob-peach absolute w-60 h-60 -bottom-10 -right-10 pointer-events-none" />
      <div className="blob-navy absolute w-56 h-56 top-1/2 left-1/3 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5D688A]/70 hover:text-[#5D688A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        <div
          className="glass rounded-3xl p-8"
          style={{
            border: "1px solid rgba(255,255,255,0.75)",
            boxShadow: "0 20px 60px rgba(93,104,138,0.15)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F7A5A5] to-[#FFDBB6] opacity-60 blur-md" />
              <div
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #5D688A 0%, #7a88b0 100%)",
                  boxShadow: "0 8px 25px rgba(93,104,138,0.35)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 1.5 2C1.5 2 1 6 2 8.5C3 11 4 12 4 15C4 18 5 22 7 22C8.5 22 9 20 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C15 20 15.5 22 17 22C19 22 20 18 20 15C20 12 21 11 22 8.5C23 6 22.5 2 22.5 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#3a3f52]">
              Login Dashboard
            </h1>
            <p className="text-sm text-[#5D688A]/65 mt-1">
              Masuk ke dashboard drg. Bunga Maureen
            </p>
          </div>

          {error && (
            <div
              className="rounded-2xl p-3 mb-5 text-sm text-center font-medium"
              style={{
                background: "rgba(247,165,165,0.2)",
                border: "1px solid rgba(247,165,165,0.4)",
                color: "#c0504f",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#5D688A] mb-2">
                <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bunga@dentist.com"
                required
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1.5px solid rgba(93,104,138,0.2)",
                  color: "#3a3f52",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F7A5A5")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(93,104,138,0.2)")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5D688A] mb-2">
                <Lock className="w-3.5 h-3.5 inline mr-1" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1.5px solid rgba(93,104,138,0.2)",
                  color: "#3a3f52",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#F7A5A5")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(93,104,138,0.2)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 tap-feedback"
              style={{
                background: "linear-gradient(135deg, #5D688A 0%, #7a88b0 100%)",
                boxShadow: "0 6px 20px rgba(93,104,138,0.35)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#5D688A]/50 mt-6">
            Dashboard ini hanya untuk dokter gigi yang berwenang.
          </p>
        </div>
      </div>
    </div>
  );
}
