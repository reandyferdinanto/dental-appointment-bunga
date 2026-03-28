"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar, Users, CheckCircle2, Clock,
  BookOpen, ArrowRight, TrendingUp, RefreshCw,
} from "lucide-react";
import {
  NeuButton,
  NeuCard,
  NeuChip,
  NeuIconTile,
} from "@/components/ui/neumorphism";

interface Appointment {
  id: string; patientName: string; date: string;
  time: string; status: string; complaint: string;
}

const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

const today = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
})();

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [logbookCount, setLogbookCount] = useState<number | null>(null);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  // Parallel fetch: appointments + logbook count simultaneously
  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [aptRes, logRes] = await Promise.all([
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/logbook",      { cache: "no-store" }),
      ]);
      const [aptData, logData] = await Promise.all([aptRes.json(), logRes.json()]);
      if (Array.isArray(aptData)) setAppointments(aptData);
      if (Array.isArray(logData)) setLogbookCount(logData.length);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadData]);

  const todayAppts     = appointments.filter(a => a.date === today);
  const pendingAppts   = appointments.filter(a => a.status === "pending");
  const completedAppts = appointments.filter(a => a.status === "completed");
  const upcomingAppts  = appointments
    .filter(a => a.date >= today && a.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  const statusColors: Record<string, string> = {
    pending:   "bg-[#FEC3C3]/45 text-[#c77b7b]",
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
    pending: "Menunggu", confirmed: "Dikonfirmasi",
    completed: "Selesai", cancelled: "Dibatalkan",
  };

  const statCards = [
    { label: "Pasien Hari Ini",     value: todayAppts.length,     icon: Calendar,     bg: "rgba(253,172,172,0.18)", color: "#FDACAC", border: "rgba(253,172,172,0.34)" },
    { label: "Menunggu Konfirmasi", value: pendingAppts.length,   icon: Clock,        bg: "rgba(254,195,195,0.26)", color: "#c77b7b", border: "rgba(254,195,195,0.46)"  },
    { label: "Selesai",             value: completedAppts.length, icon: CheckCircle2, bg: "rgba(247,215,215,0.70)", color: "#bb7f7f", border: "rgba(247,215,215,0.90)" },
    { label: "Entri Logbook",       value: logbookCount ?? appointments.length, icon: Users, bg: "rgba(93,104,138,0.12)", color: "#5D688A", border: "rgba(93,104,138,0.25)" },
  ];

  return (
    <div className="surface-stack">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3a3f52]">
            Selamat Datang, Bunga! 👋
          </h1>
          <p className="text-sm text-[#5D688A]/65 mt-1">
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
          className="tap-feedback"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </NeuButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <NeuCard key={stat.label} className="neu-card-hover rounded-[28px] p-4 sm:p-5 transition-all duration-200 tap-feedback"
            style={{ borderColor: stat.border }}>
            <div className="mb-2 sm:mb-3">
              <NeuIconTile className="h-9 w-9 rounded-2xl sm:h-10 sm:w-10" style={{ background: stat.bg, color: stat.color }}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color }} />
              </NeuIconTile>
            </div>
            {loading ? (
              <div className="h-7 w-10 rounded-lg animate-pulse mb-1" style={{ background: "rgba(93,104,138,0.1)" }} />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-[#3a3f52]">{stat.value}</p>
            )}
            <p className="text-[10px] sm:text-xs text-[#5D688A]/60 mt-0.5 leading-tight">{stat.label}</p>
          </NeuCard>
        ))}
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <NeuCard className="rounded-[30px] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="font-bold text-[#3a3f52] text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#FDACAC" }} />
              Janji Temu Mendatang
            </h2>
            <Link href="/dashboard/appointments"
              className="text-xs font-semibold flex items-center gap-1 transition-colors tap-feedback"
              style={{ color: "#5D688A" }}>
              Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-3 rounded-2xl p-3"
                  style={{ background: "rgba(254,195,195,0.18)" }}>
                  <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: "rgba(93,104,138,0.1)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded-lg w-1/3" style={{ background: "rgba(93,104,138,0.1)" }} />
                    <div className="h-2 rounded-lg w-1/2" style={{ background: "rgba(93,104,138,0.08)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingAppts.length > 0 ? (
            <div className="space-y-2">
              {upcomingAppts.map((apt) => {
                const d = new Date(apt.date + "T00:00:00");
                return (
                  <NeuCard key={apt.id} className="flex items-center gap-3 rounded-2xl p-3 transition-all tap-feedback">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex flex-col items-center justify-center shrink-0"
                      style={{ background: "#e6e7ee", border: "1px solid rgba(255,255,255,0.52)", boxShadow: "4px 4px 8px rgba(163,177,198,0.16), -4px -4px 8px rgba(255,255,255,0.34)" }}>
                      <span className="text-[8px] font-bold" style={{ color: "#FDACAC" }}>{monthNames[d.getMonth()]}</span>
                      <span className="text-sm font-extrabold text-[#3a3f52] -mt-0.5">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3a3f52] truncate">{apt.patientName}</p>
                      <p className="text-xs text-[#5D688A]/60">{apt.time} · {apt.complaint.slice(0,22)}…</p>
                    </div>
                    <NeuChip className={`shrink-0 px-2 py-1 text-[9px] ${statusColors[apt.status]}`}
                      style={{ background: statusBg[apt.status] }}>
                      {statusLabels[apt.status]}
                    </NeuChip>
                  </NeuCard>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#5D688A]/50">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada janji temu</p>
            </div>
          )}
        </NeuCard>

        {/* Quick Actions */}
        <NeuCard className="rounded-[30px] p-4 sm:p-6">
          <h2 className="font-bold text-[#3a3f52] text-sm sm:text-base flex items-center gap-2 mb-4 sm:mb-5">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#FEC3C3" }} />
            Aksi Cepat
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {[
              { href: "/dashboard/appointments", label: "Kelola Janji Temu",   desc: "Lihat, konfirmasi, atau batalkan janji pasien",  icon: Calendar, bg: "rgba(253,172,172,0.18)", color: "#FDACAC" },
              { href: "/dashboard/schedules",    label: "Atur Jadwal Praktik", desc: "Tambah atau ubah slot jadwal tersedia",           icon: Clock,    bg: "rgba(254,195,195,0.24)", color: "#c77b7b" },
              { href: "/dashboard/logbook",      label: "Catat Logbook",       desc: "Tambahkan catatan tindakan medis ke E-Logbook",  icon: BookOpen, bg: "rgba(93,104,138,0.12)",  color: "#5D688A" },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="block tap-feedback">
                <NeuCard className="flex items-center gap-3 rounded-2xl p-3.5 transition-all hover:scale-[1.01] sm:gap-4 sm:p-4">
                  <NeuIconTile className="h-9 w-9 rounded-2xl shrink-0 sm:h-10 sm:w-10" style={{ background: action.bg, color: action.color }}>
                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: action.color }} />
                  </NeuIconTile>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3a3f52]">{action.label}</p>
                    <p className="text-xs text-[#5D688A]/60 truncate">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#5D688A]/40 shrink-0" />
                </NeuCard>
              </Link>
            ))}
          </div>
        </NeuCard>
      </div>
    </div>
  );
}


