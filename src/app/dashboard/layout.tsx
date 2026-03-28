"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  CalendarClock,
  ChevronRight,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import {
  NeuButton,
  NeuCard,
  NeuIconTile,
} from "@/components/ui/neumorphism";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Janji Temu", icon: Calendar },
  { href: "/dashboard/schedules", label: "Jadwal", icon: CalendarClock },
  { href: "/dashboard/logbook", label: "E-Logbook", icon: BookOpen },
  { href: "/dashboard/rekam-medis", label: "Rekam Medis", icon: FileText },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
] as const;

const ToothLogo = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5 fill-white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 1.5 2C1.5 2 1 6 2 8.5C3 11 4 12 4 15C4 18 5 22 7 22C8.5 22 9 20 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C15 20 15.5 22 17 22C19 22 20 18 20 15C20 12 21 11 22 8.5C23 6 22.5 2 22.5 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
  </svg>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expiryWarning, setExpiryWarning] = useState<number | null>(null);

  useEffect(() => {
    const loginTime = (session?.user as { loginTime?: number } | undefined)
      ?.loginTime;
    if (!loginTime) return;

    const sixHours = 6 * 60 * 60 * 1000;
    const warnAt = 15 * 60 * 1000;

    const tick = () => {
      const remaining = sixHours - (Date.now() - loginTime);

      if (remaining <= 0) {
        void signOut({ callbackUrl: "/login?reason=session_expired" });
        return;
      }

      setExpiryWarning(
        remaining <= warnAt ? Math.ceil(remaining / 60000) : null
      );
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [session]);

  const NavLink = ({
    href,
    label,
    icon: Icon,
    onClick,
  }: {
    href: string;
    label: string;
    icon: (typeof sidebarLinks)[number]["icon"];
    onClick?: () => void;
  }) => {
    const isActive = pathname === href;

    return (
      <Link href={href} onClick={onClick} className="block">
        <NeuCard
          className={`mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all tap-feedback ${
            isActive
              ? "bg-[#4e6785] text-white"
              : "neu-card-hover text-[#4e6785]"
          }`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1">{label}</span>
          {isActive ? <ChevronRight className="h-4 w-4 opacity-70" /> : null}
        </NeuCard>
      </Link>
    );
  };

  const renderSidebarContent = (isMobile = false) => (
    <>
      <div
        className="p-5"
        style={{ borderBottom: "1px solid rgba(211,221,232,0.78)" }}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FDACAC] to-[#FEC3C3] opacity-35 blur-[6px]" />
            <NeuIconTile tone="primary" className="relative h-10 w-10 rounded-2xl">
              <ToothLogo />
            </NeuIconTile>
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-[#2c3d52]">
              drg. Bunga Maureen
            </span>
            <span className="text-[10px] font-medium text-[#E79191]">
              Healthcare SaaS Admin
            </span>
          </div>
          {isMobile ? (
            <NeuButton
              onClick={() => setSidebarOpen(false)}
              size="sm"
              className="rounded-xl px-2 py-2"
            >
              <X className="h-5 w-5" />
            </NeuButton>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 p-3">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
          />
        ))}
      </nav>

      <div
        className="p-3"
        style={{ borderTop: "1px solid rgba(211,221,232,0.78)" }}
      >
        <Link
          href="/"
          className="mb-2 block rounded-2xl px-4 py-2.5 text-sm font-medium text-[#4e6785] transition-all tap-feedback btn-neu-secondary"
          onClick={isMobile ? () => setSidebarOpen(false) : undefined}
        >
          ← Ke Website
        </Link>
        <NeuButton
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="danger"
          className="w-full justify-start px-4 py-2.5 text-sm font-medium"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </NeuButton>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-mesh">
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 lg:hidden"
        style={{
          background: "#e6e7ee",
          borderBottom: "1px solid rgba(255,255,255,0.58)",
          boxShadow: "8px 8px 16px rgba(163,177,198,0.16), -8px -8px 16px rgba(255,255,255,0.5)",
        }}
      >
        <NeuButton
          onClick={() => setSidebarOpen(true)}
          size="sm"
          className="rounded-xl px-2 py-2"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </NeuButton>
        <div className="flex items-center gap-2">
          <NeuIconTile tone="primary" className="h-7 w-7 rounded-xl">
            <ToothLogo />
          </NeuIconTile>
          <span className="text-sm font-bold text-[#2c3d52]">Dashboard</span>
        </div>
        <div className="w-9" />
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#3a3f52]/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 top-0 flex w-72 flex-col animate-slide-up"
            style={{
              background: "#e6e7ee",
              borderRight: "1px solid rgba(255,255,255,0.58)",
              boxShadow: "12px 0 24px rgba(163,177,198,0.16)",
            }}
          >
            {renderSidebarContent(true)}
          </div>
        </div>
      ) : null}

      <div className="flex">
        <aside
          className="fixed bottom-0 left-0 top-0 z-40 hidden w-64 flex-col lg:flex"
          style={{
            background: "#e6e7ee",
            borderRight: "1px solid rgba(255,255,255,0.58)",
            boxShadow: "10px 0 20px rgba(163,177,198,0.14)",
          }}
        >
          {renderSidebarContent()}
        </aside>

        <main className="min-h-screen flex-1 lg:ml-64">
          {expiryWarning !== null ? (
            <div
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
              style={{
                background: "#e6e7ee",
                color: "#4e6785",
                borderBottom: "1px solid rgba(255,255,255,0.58)",
              }}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Sesi Anda akan berakhir dalam{" "}
              <strong>{expiryWarning} menit</strong>. Simpan pekerjaan Anda.
              <NeuButton
                onClick={() => signOut({ callbackUrl: "/login" })}
                size="sm"
                className="ml-auto px-3 py-1 text-xs"
              >
                Login Ulang
              </NeuButton>
            </div>
          ) : null}
          <div className="p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">{children}</div>
        </main>
      </div>

      <nav className="mobile-bottom-nav lg:hidden">
        <div className="flex items-center justify-around px-2 pb-1 pt-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="tap-feedback flex min-w-[56px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all"
                style={
                  isActive
                    ? {
                        background: "#e6e7ee",
                        border: "1px solid rgba(255,255,255,0.58)",
                        boxShadow:
                          "4px 4px 8px rgba(163,177,198,0.18), -4px -4px 8px rgba(255,255,255,0.54)",
                      }
                    : {}
                }
              >
                <Icon
                  className="h-5 w-5 transition-colors"
                  style={{
                    color: isActive ? "#4e6785" : "rgba(78,103,133,0.45)",
                  }}
                />
                <span
                  className="text-[9px] font-semibold leading-tight transition-colors"
                  style={{
                    color: isActive ? "#4e6785" : "rgba(78,103,133,0.45)",
                  }}
                >
                  {link.label}
                </span>
                {isActive ? (
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ background: "#FDACAC" }}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
