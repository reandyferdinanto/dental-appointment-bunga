"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowLeft, Clock } from "lucide-react";
import {
  NeuAlert,
  NeuButton,
  NeuCard,
  NeuIconTile,
  NeuInput,
} from "@/components/ui/neumorphism";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const sessionExpired = searchParams.get("reason") === "session_expired";

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

        <NeuCard className="rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <NeuIconTile tone="primary" className="relative h-16 w-16 rounded-2xl">
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 1.5 2C1.5 2 1 6 2 8.5C3 11 4 12 4 15C4 18 5 22 7 22C8.5 22 9 20 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C15 20 15.5 22 17 22C19 22 20 18 20 15C20 12 21 11 22 8.5C23 6 22.5 2 22.5 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
                </svg>
              </NeuIconTile>
            </div>
            <h1 className="text-2xl font-bold text-[#3a3f52]">
              Login Dashboard
            </h1>
            <p className="text-sm text-[#5D688A]/65 mt-1">
              Masuk ke dashboard drg. Bunga Maureen
            </p>
          </div>

          {sessionExpired && (
            <NeuAlert className="mb-4 flex items-center gap-2 text-center font-medium" tone="secondary">
              <Clock className="w-4 h-4 shrink-0" />
              Sesi Anda telah berakhir (6 jam). Silakan login kembali.
            </NeuAlert>
          )}

          {error && (
            <NeuAlert
              className="mb-5 text-center font-medium"
              tone="danger"
            >
              {error}
            </NeuAlert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#5D688A] mb-2">
                <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
              </label>
              <NeuInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bunga@dentist.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5D688A] mb-2">
                <Lock className="w-3.5 h-3.5 inline mr-1" /> Password
              </label>
              <NeuInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                required
              />
            </div>

            <NeuButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="mt-2 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </NeuButton>
          </form>

          <p className="text-center text-xs text-[#5D688A]/50 mt-6">
            Dashboard ini hanya untuk dokter gigi yang berwenang.
          </p>
        </NeuCard>
      </div>
    </div>
  );
}



