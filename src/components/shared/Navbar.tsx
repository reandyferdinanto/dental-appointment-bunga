"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Menu, X, Sparkles, Calendar, Clock, Home, Stethoscope } from "lucide-react";

const navLinks = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/jadwal", label: "Jadwal", icon: Clock },
  { href: "/analisa-gejala", label: "Analisa", icon: Stethoscope },
  { href: "/booking", label: "Booking", icon: Calendar },
];

interface PublicSettings {
  clinicName?: string;
  doctorName?: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [publicSettings, setPublicSettings] = useState<PublicSettings>({});
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdminLoggedIn = status === "authenticated" && (role === "admin" || role === "superadmin");
  const roleLabel = role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "";
  const doctorName = String(publicSettings.doctorName || "Bunga Maureen")
    .replace(/^drg\.?\s*/i, "")
    .trim() || "Bunga Maureen";
  const clinicName = String(publicSettings.clinicName || "Healthcare SaaS");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setPublicSettings({
          clinicName: data.clinicName,
          doctorName: data.doctorName,
        });
      } catch {
        // Keep defaults when settings API is unavailable.
      }
    }

    void loadSettings();
  }, []);

  return (
    <nav
      ref={menuRef}
      className="glass sticky top-0 z-50"
      style={{
        background: "rgba(230,231,238,0.94)",
        borderBottom: "1px solid rgba(255,255,255,0.55)",
        boxShadow: "6px 6px 12px rgba(163,177,198,0.14), -6px -6px 12px rgba(255,255,255,0.24)",
      }}
    >
      <div className="section-shell px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group tap-feedback" aria-label="Beranda">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10">
              <div
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: "#4e6785",
                  boxShadow: "4px 4px 8px rgba(137,150,166,0.22), -4px -4px 8px rgba(255,255,255,0.1)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 1.5 2C1.5 2 1 6 2 8.5C3 11 4 12 4 15C4 18 5 22 7 22C8.5 22 9 20 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C15 20 15.5 22 17 22C19 22 20 18 20 15C20 12 21 11 22 8.5C23 6 22.5 2 22.5 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-bold text-[#4e6785] text-sm leading-tight block">{`drg. ${doctorName}`}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#E79191] font-semibold leading-tight">{clinicName}</span>
                {isAdminLoggedIn && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                    style={{
                      color: "#4e6785",
                      background: "rgba(253,172,172,0.22)",
                      border: "1px solid rgba(253,172,172,0.35)",
                    }}
                  >
                    {roleLabel}
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={isActive ? {
                    background: "#e6e7ee",
                    color: "#4e6785",
                    fontWeight: 700,
                    boxShadow: "4px 4px 8px rgba(163,177,198,0.2), -4px -4px 8px rgba(255,255,255,0.46)",
                  } : {
                    color: "rgba(78,103,133,0.78)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href={isAdminLoggedIn ? "/dashboard" : "/login"}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#4e6785]/80 hover:text-[#4e6785] transition-all duration-200 btn-neu-secondary"
            >
              {isAdminLoggedIn ? "Dashboard" : "Login"}
            </Link>
            <Link
              href="/booking"
              className="btn-neu-primary min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Buat Janji
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 rounded-xl text-[#4e6785] transition-colors tap-feedback"
            style={{ boxShadow: "4px 4px 8px rgba(163,177,198,0.18), -4px -4px 8px rgba(255,255,255,0.44)" }}
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{ borderTop: isOpen ? "1px solid rgba(255,255,255,0.85)" : "none" }}
      >
        <div className="space-y-2 px-4 py-3" style={{ background: "rgba(230,231,238,0.98)" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all tap-feedback"
                style={isActive ? {
                  background: "#e6e7ee",
                  color: "#4e6785",
                  fontWeight: 700,
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "inset 2px 2px 4px rgba(163,177,198,0.22), inset -2px -2px 4px rgba(255,255,255,0.36)",
                } : {
                  color: "#4e6785",
                }}
              >
                <Icon className="w-4 h-4" style={{ color: isActive ? "#FDACAC" : "rgba(78,103,133,0.6)" }} />
                {link.label}
                {isActive && <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold chip-neu" style={{ color: "#FDACAC" }}>Aktif</span>}
              </Link>
            );
          })}
          <Link
            href={isAdminLoggedIn ? "/dashboard" : "/login"}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-[#4e6785] transition-all tap-feedback"
          >
            <svg className="w-4 h-4 text-[#4e6785]/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            {isAdminLoggedIn ? "Dashboard" : "Login"}
          </Link>
          <Link
            href="/booking"
            onClick={() => setIsOpen(false)}
            className="btn-neu-primary flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-white tap-feedback"
          >
            <Sparkles className="w-4 h-4" />
            Buat Janji Sekarang
          </Link>
        </div>
      </div>
    </nav>
  );
}

