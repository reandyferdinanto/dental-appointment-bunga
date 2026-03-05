"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar, Users, CheckCircle2, Clock,
  BookOpen, ArrowRight, TrendingUp, RefreshCw,
} from "lucide-react";

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

  useEffect(() => { loadData(); }, [loadData]);

  const todayAppts     = appointments.filter(a => a.date === today);
  const pendingAppts   = appointments.filter(a => a.status === "pending");
  const completedAppts = appointments.filter(a => a.status === "completed");
  const upcomingAppts  = appointments
    .filter(a => a.date >= today && a.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  const statusColors: Record<string, string> = {
    pending:   "bg-[#FFDBB6]/40 text-[#b87333]",
    confirmed: "bg-[#5D688A]/10 text-[#5D688A]",
    completed: "bg-[#6ec6a0]/20 text-[#3aaa7c]",
    cancelled: "bg-[#F7A5A5]/30 text-[#c0504f]",
  };
  const statusLabels: Record<string, string> = {
    pending: "Menunggu", confirmed: "Dikonfirmasi",
    completed: "Selesai", cancelled: "Dibatalkan",
  };

  const statCards = [
    { label: "Pasien Hari Ini",     value: todayAppts.length,     icon: Calendar,     bg: "rgba(247,165,165,0.18)", color: "#F7A5A5", border: "rgba(247,165,165,0.35)" },
    { label: "Menunggu Konfirmasi", value: pendingAppts.length,   icon: Clock,        bg: "rgba(255,219,182,0.25)", color: "#e8994a", border: "rgba(255,219,182,0.5)"  },
    { label: "Selesai",             value: completedAppts.length, icon: CheckCircle2, bg: "rgba(110,198,160,0.18)", color: "#3aaa7c", border: "rgba(110,198,160,0.35)" },
    { label: "Entri Logbook",       value: logbookCount ?? appointments.length, icon: Users, bg: "rgba(93,104,138,0.12)", color: "#5D688A", border: "rgba(93,104,138,0.25)" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3a3f52]">
            Selamat Datang, Bunga! 👋
          </h1>
          <p className="text-sm text-[#5D688A]/65 mt-1">
            Berikut ringkasan aktivitas klinik Anda hari ini.
          </p>
        </div>
        <button onClick={() => loadData(true)} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 tap-feedback"
          style={{ background: "rgba(93,104,138,0.08)", color: "#5D688A", border: "1px solid rgba(93,104,138,0.15)" }}>
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 sm:p-5 transition-all duration-200 tap-feedback"
            style={{ border: `1px solid ${stat.border}`, boxShadow: "0 4px 20px rgba(93,104,138,0.08)" }}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center mb-2 sm:mb-3"
              style={{ background: stat.bg }}>
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color }} />
            </div>
            {loading ? (
              <div className="h-7 w-10 rounded-lg animate-pulse mb-1" style={{ background: "rgba(93,104,138,0.1)" }} />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-[#3a3f52]">{stat.value}</p>
            )}
            <p className="text-[10px] sm:text-xs text-[#5D688A]/60 mt-0.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Upcoming Appointments */}
        <div className="glass rounded-2xl p-4 sm:p-6"
          style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 4px 20px rgba(93,104,138,0.08)" }}>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="font-bold text-[#3a3f52] text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#F7A5A5" }} />
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
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: "rgba(255,219,182,0.15)" }}>
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
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-white/50 tap-feedback">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex flex-col items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg,rgba(247,165,165,0.2),rgba(255,219,182,0.3))", border: "1px solid rgba(247,165,165,0.3)" }}>
                      <span className="text-[8px] font-bold" style={{ color: "#F7A5A5" }}>{monthNames[d.getMonth()]}</span>
                      <span className="text-sm font-extrabold text-[#3a3f52] -mt-0.5">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3a3f52] truncate">{apt.patientName}</p>
                      <p className="text-xs text-[#5D688A]/60">{apt.time} · {apt.complaint.slice(0,22)}…</p>
                    </div>
                    <span className={`text-[9px] px-2 py-1 rounded-full font-semibold shrink-0 ${statusColors[apt.status]}`}>
                      {statusLabels[apt.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#5D688A]/50">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada janji temu</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-4 sm:p-6"
          style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 4px 20px rgba(93,104,138,0.08)" }}>
          <h2 className="font-bold text-[#3a3f52] text-sm sm:text-base flex items-center gap-2 mb-4 sm:mb-5">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#FFDBB6" }} />
            Aksi Cepat
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {[
              { href: "/dashboard/appointments", label: "Kelola Janji Temu",   desc: "Lihat, konfirmasi, atau batalkan janji pasien",  icon: Calendar, bg: "rgba(247,165,165,0.18)", color: "#F7A5A5" },
              { href: "/dashboard/schedules",    label: "Atur Jadwal Praktik", desc: "Tambah atau ubah slot jadwal tersedia",           icon: Clock,    bg: "rgba(255,219,182,0.25)", color: "#e8994a" },
              { href: "/dashboard/logbook",      label: "Catat Logbook",       desc: "Tambahkan catatan tindakan medis ke E-Logbook",  icon: BookOpen, bg: "rgba(93,104,138,0.12)",  color: "#5D688A" },
            ].map((action) => (
              <Link key={action.href} href={action.href}
                className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl transition-all hover:scale-[1.01] hover:shadow-md active:scale-95 tap-feedback"
                style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.8)" }}>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: action.bg }}>
                  <action.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: action.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#3a3f52]">{action.label}</p>
                  <p className="text-xs text-[#5D688A]/60 truncate">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#5D688A]/40 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

