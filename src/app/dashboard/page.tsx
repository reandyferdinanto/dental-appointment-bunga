"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  NeuButton,
  NeuCard,
  NeuChip,
  NeuIconTile,
} from "@/components/ui/neumorphism";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  complaint: string;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const today = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [logbookCount, setLogbookCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    try {
      const [aptRes, logRes] = await Promise.all([
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/logbook", { cache: "no-store" }),
      ]);
      const [aptData, logData] = await Promise.all([aptRes.json(), logRes.json()]);

      if (Array.isArray(aptData)) setAppointments(aptData);
      if (Array.isArray(logData)) setLogbookCount(logData.length);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(id);
  }, [loadData]);

  const todayAppts = appointments.filter((appointment) => appointment.date === today);
  const pendingAppts = appointments.filter((appointment) => appointment.status === "pending");
  const completedAppts = appointments.filter((appointment) => appointment.status === "completed");
  const upcomingAppts = appointments
    .filter((appointment) => appointment.date >= today && appointment.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  const statusColors: Record<string, string> = {
    pending: "bg-[#FEC3C3]/45 text-[#c77b7b]",
    confirmed: "bg-[#5D688A]/10 text-[#5D688A]",
    completed: "bg-[#F7D7D7]/70 text-[#bb7f7f]",
    cancelled: "bg-[#FDACAC]/30 text-[#bb6868]",
  };

  const statusBg: Record<string, string> = {
    pending: "rgba(254,195,195,0.38)",
    confirmed: "rgba(93,104,138,0.10)",
    completed: "rgba(247,215,215,0.72)",
    cancelled: "rgba(253,172,172,0.20)",
  };

  const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  const statCards = [
    {
      label: "Pasien Hari Ini",
      value: todayAppts.length,
      icon: Calendar,
      bg: "rgba(253,172,172,0.18)",
      color: "#FDACAC",
      border: "rgba(253,172,172,0.34)",
    },
    {
      label: "Menunggu Konfirmasi",
      value: pendingAppts.length,
      icon: Clock,
      bg: "rgba(254,195,195,0.26)",
      color: "#c77b7b",
      border: "rgba(254,195,195,0.46)",
    },
    {
      label: "Selesai",
      value: completedAppts.length,
      icon: CheckCircle2,
      bg: "rgba(247,215,215,0.70)",
      color: "#bb7f7f",
      border: "rgba(247,215,215,0.90)",
    },
    {
      label: "Entri Logbook",
      value: logbookCount ?? appointments.length,
      icon: Users,
      bg: "rgba(93,104,138,0.12)",
      color: "#5D688A",
      border: "rgba(93,104,138,0.25)",
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/appointments",
      label: "Kelola Janji Temu",
      desc: "Lihat, konfirmasi, atau batalkan janji pasien",
      icon: Calendar,
      bg: "rgba(253,172,172,0.18)",
      color: "#FDACAC",
    },
    {
      href: "/dashboard/schedules",
      label: "Atur Jadwal Praktik",
      desc: "Tambah atau ubah slot jadwal tersedia",
      icon: Clock,
      bg: "rgba(254,195,195,0.24)",
      color: "#c77b7b",
    },
    {
      href: "/dashboard/logbook",
      label: "Catat Logbook",
      desc: "Tambahkan catatan tindakan medis ke E-Logbook",
      icon: BookOpen,
      bg: "rgba(93,104,138,0.12)",
      color: "#5D688A",
    },
  ];

  return (
    <div className="surface-stack">
      <div className="mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold leading-tight text-[#3a3f52] sm:text-2xl">
            Selamat Datang, Bunga!
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-[#5D688A]/65 sm:text-sm">
            Berikut ringkasan aktivitas klinik Anda hari ini.
          </p>
          <div className="mt-3">
            <NeuChip className="px-3 py-1.5" style={{ color: "#4e6785" }}>
              Dashboard Harian
            </NeuChip>
          </div>
        </div>

        <NeuButton
          onClick={() => loadData(true)}
          disabled={refreshing}
          size="sm"
          className="tap-feedback self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </NeuButton>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <NeuCard
            key={stat.label}
            className="neu-card-hover rounded-[24px] p-4 transition-all duration-200 tap-feedback sm:rounded-[28px] sm:p-5"
            style={{ borderColor: stat.border }}
          >
            <div className="mb-2 flex items-start justify-between gap-3 sm:mb-3 sm:block">
              <NeuIconTile
                className="h-9 w-9 rounded-2xl sm:h-10 sm:w-10"
                style={{ background: stat.bg, color: stat.color }}
              >
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color }} />
              </NeuIconTile>

              <div className="min-w-0 flex-1 sm:mt-3">
                {loading ? (
                  <div
                    className="mb-1 ml-auto h-7 w-10 animate-pulse rounded-lg sm:ml-0 sm:w-12"
                    style={{ background: "rgba(93,104,138,0.1)" }}
                  />
                ) : (
                  <p className="text-right text-2xl font-bold text-[#3a3f52] sm:text-left">
                    {stat.value}
                  </p>
                )}
                <p className="mt-0.5 text-right text-xs leading-tight text-[#5D688A]/60 sm:text-left">
                  {stat.label}
                </p>
              </div>
            </div>
          </NeuCard>
        ))}
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        <NeuCard className="rounded-[24px] p-4 sm:rounded-[30px] sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:items-center">
            <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold text-[#3a3f52] sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#FDACAC" }} />
              Janji Temu Mendatang
            </h2>
            <Link
              href="/dashboard/appointments"
              className="tap-feedback flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: "#5D688A" }}
            >
              Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl p-3"
                  style={{ background: "rgba(254,195,195,0.18)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 shrink-0 rounded-xl"
                      style={{ background: "rgba(93,104,138,0.1)" }}
                    />
                    <div className="flex-1 space-y-2">
                      <div
                        className="h-3 w-1/3 rounded-lg"
                        style={{ background: "rgba(93,104,138,0.1)" }}
                      />
                      <div
                        className="h-2 w-1/2 rounded-lg"
                        style={{ background: "rgba(93,104,138,0.08)" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingAppts.length > 0 ? (
            <div className="space-y-2">
              {upcomingAppts.map((appointment) => {
                const date = new Date(`${appointment.date}T00:00:00`);

                return (
                  <NeuCard key={appointment.id} className="rounded-2xl p-3 transition-all tap-feedback">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-2xl sm:h-11 sm:w-11"
                        style={{
                          background: "#e6e7ee",
                          border: "1px solid rgba(255,255,255,0.52)",
                          boxShadow: "4px 4px 8px rgba(163,177,198,0.16), -4px -4px 8px rgba(255,255,255,0.34)",
                        }}
                      >
                        <span className="text-[8px] font-bold" style={{ color: "#FDACAC" }}>
                          {monthNames[date.getMonth()]}
                        </span>
                        <span className="-mt-0.5 text-sm font-extrabold text-[#3a3f52]">
                          {date.getDate()}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#3a3f52]">
                          {appointment.patientName}
                        </p>
                        <p className="mt-0.5 break-words text-xs leading-relaxed text-[#5D688A]/60 sm:truncate">
                          {appointment.time} · {appointment.complaint}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <NeuChip
                        className={`px-2.5 py-1 text-[10px] ${statusColors[appointment.status]}`}
                        style={{ background: statusBg[appointment.status] }}
                      >
                        {statusLabels[appointment.status]}
                      </NeuChip>
                    </div>
                  </NeuCard>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-[#5D688A]/50">
              <Calendar className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">Belum ada janji temu</p>
            </div>
          )}
        </NeuCard>

        <NeuCard className="rounded-[24px] p-4 sm:rounded-[30px] sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#3a3f52] sm:mb-5 sm:text-base">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#FEC3C3" }} />
            Aksi Cepat
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="block tap-feedback">
                <NeuCard className="flex items-start gap-3 rounded-2xl p-3.5 transition-all hover:scale-[1.01] sm:items-center sm:gap-4 sm:p-4">
                  <NeuIconTile
                    className="h-9 w-9 shrink-0 rounded-2xl sm:h-10 sm:w-10"
                    style={{ background: action.bg, color: action.color }}
                  >
                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: action.color }} />
                  </NeuIconTile>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight text-[#3a3f52]">
                      {action.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#5D688A]/60 sm:truncate">
                      {action.desc}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-[#5D688A]/40" />
                </NeuCard>
              </Link>
            ))}
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
