"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard",              label: "Overview",       icon: LayoutDashboard, emoji: "📊" },
  { href: "/dashboard/appointments", label: "Janji Temu",     icon: Calendar,        emoji: "📅" },
  { href: "/dashboard/schedules",    label: "Jadwal",         icon: CalendarClock,   emoji: "🗓️" },
  { href: "/dashboard/logbook",      label: "E-Logbook",      icon: BookOpen,        emoji: "📖" },
];

const ToothLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 1.5 2C1.5 2 1 6 2 8.5C3 11 4 12 4 15C4 18 5 22 7 22C8.5 22 9 20 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C15 20 15.5 22 17 22C19 22 20 18 20 15C20 12 21 11 22 8.5C23 6 22.5 2 22.5 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
  </svg>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavLink = ({ link, onClick }: { link: typeof sidebarLinks[0]; onClick?: () => void }) => {
    const isActive = pathname === link.href;
    return (
      <Link href={link.href} onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 tap-feedback"
        style={isActive ? {
          background: "linear-gradient(135deg, #5D688A 0%, #7a88b0 100%)",
          color: "white",
          boxShadow: "0 4px 15px rgba(93,104,138,0.35)"
        } : { color: "rgba(93,104,138,0.75)" }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.5)"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = ""; }}
      >
        <link.icon className="w-5 h-5 shrink-0" />
        <span className="flex-1">{link.label}</span>
        {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
      </Link>
    );
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Brand */}
      <div className="p-5" style={{ borderBottom: "1px solid rgba(93,104,138,0.12)" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F7A5A5] to-[#FFDBB6] opacity-50 blur-sm" />
            <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)", boxShadow: "0 4px 15px rgba(93,104,138,0.3)" }}>
              <ToothLogo />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-sm text-[#3a3f52] block truncate">drg. Bunga Maureen</span>
            <span className="text-[10px] font-medium" style={{ color: "#F7A5A5" }}>Dashboard Koas ✨</span>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/50 text-[#5D688A] tap-feedback">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {sidebarLinks.map(link => (
          <NavLink key={link.href} link={link} onClick={isMobile ? () => setSidebarOpen(false) : undefined} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(93,104,138,0.12)" }}>
        <Link href="/"
          className="block px-4 py-2.5 rounded-2xl text-sm font-medium text-[#5D688A]/60 hover:text-[#5D688A] hover:bg-white/50 transition-all mb-1 tap-feedback"
          onClick={isMobile ? () => setSidebarOpen(false) : undefined}>
          ← Ke Website
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all tap-feedback"
          style={{ color: "#F7A5A5" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(247,165,165,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = ""}>
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-mesh">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(255,242,239,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(247,165,165,0.2)" }}>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-[#5D688A] hover:bg-white/50 transition-colors tap-feedback" aria-label="Buka menu">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)" }}>
            <ToothLogo />
          </div>
          <span className="font-bold text-sm text-[#3a3f52]">Dashboard</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#3a3f52]/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 flex flex-col animate-slide-up"
            style={{ background: "rgba(255,242,239,0.97)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.6)" }}>
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40"
          style={{ background: "rgba(255,242,239,0.88)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.6)", boxShadow: "4px 0 24px rgba(93,104,138,0.08)" }}>
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Add bottom padding on mobile for bottom nav */}
          <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav lg:hidden">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all tap-feedback min-w-[56px]"
                style={isActive ? {
                  background: "rgba(247,165,165,0.18)",
                } : {}}>
                <Icon className="w-5 h-5 transition-colors"
                  style={{ color: isActive ? "#5D688A" : "rgba(93,104,138,0.45)" }} />
                <span className="text-[9px] font-semibold transition-colors leading-tight"
                  style={{ color: isActive ? "#5D688A" : "rgba(93,104,138,0.45)" }}>
                  {link.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full" style={{ background: "#F7A5A5" }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
