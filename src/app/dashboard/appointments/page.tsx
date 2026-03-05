"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Phone,
  FileText,
  Loader2,
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  time: string;
  complaint: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending:   "border-[#FFDBB6] text-[#b87333]",
  confirmed: "border-[#5D688A]/30 text-[#5D688A]",
  completed: "border-green-200 text-[#3aaa7c]",
  cancelled: "border-[#F7A5A5]/50 text-[#c0504f]",
};

const statusBg: Record<string, string> = {
  pending:   "rgba(255,219,182,0.35)",
  confirmed: "rgba(93,104,138,0.10)",
  completed: "rgba(110,198,160,0.18)",
  cancelled: "rgba(247,165,165,0.20)",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const monthNames = [
  "Jan","Feb","Mar","Apr","Mei","Jun",
  "Jul","Agu","Sep","Okt","Nov","Des",
];

const monthNamesFull = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

/** Safely parse any date string to a local Date. Returns null if invalid. */
function parseDateStr(raw: string): Date | null {
  if (!raw || raw === "undefined" || raw === "null") return null;
  // 1. YYYY-MM-DD  → parse as local (no UTC shift)
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (!isNaN(d.getTime()) && d.getFullYear() >= 1990) return d;
  }
  // 2. Native parse (ISO full strings, locale strings)
  const d2 = new Date(raw);
  if (!isNaN(d2.getTime()) && d2.getFullYear() >= 1990) return d2;
  return null;
}

/** Safely format a time string — strips any 1899 Date object garbage */
function fmtTime(raw: string): string {
  if (!raw) return "-";
  const s = raw.trim();
  // Already HH:mm or H:mm
  if (/^\d{1,2}:\d{2}$/.test(s)) return s;
  // Extract HH:mm from any date-like string (e.g. "Sat Dec 30 1899 09:00:00 GMT+0707...")
  const hmMatch = /\b(\d{1,2}):(\d{2})(?::\d{2})?\b/.exec(s);
  if (hmMatch) {
    return `${String(hmMatch[1]).padStart(2,"0")}:${hmMatch[2]}`;
  }
  // Try native Date parse as last resort
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const h = d.getHours(), mn = d.getMinutes();
    return `${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;
  }
  return s;
}

/** Format a date for full display: "Kamis, 5 Maret 2026" */
function fmtDateFull(raw: string): string {
  const d = parseDateStr(raw);
  if (!d) return raw || "-";
  const days = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  return `${days[d.getDay()]}, ${d.getDate()} ${monthNamesFull[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? updated : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
    setUpdating(null);
  }

  const filtered = appointments.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#3a3f52]">Janji Temu Pasien</h1>
        <p className="text-sm text-[#5D688A]/65 mt-1">Kelola dan pantau semua janji temu pasien Anda</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D688A]/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pasien..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }}
            onFocus={e => e.currentTarget.style.borderColor = "#F7A5A5"}
            onBlur={e => e.currentTarget.style.borderColor = "rgba(93,104,138,0.15)"}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#5D688A]/50 shrink-0" />
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 tap-feedback"
              style={filter === s ? {
                background: "linear-gradient(135deg, #5D688A, #7a88b0)",
                color: "white",
                boxShadow: "0 4px 12px rgba(93,104,138,0.3)"
              } : {
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(93,104,138,0.15)",
                color: "#5D688A"
              }}>
              {s === "all" ? "Semua" : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse"
              style={{ border: "1px solid rgba(255,255,255,0.7)" }}>
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl" style={{ background: "rgba(93,104,138,0.08)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded-lg w-1/4" style={{ background: "rgba(93,104,138,0.08)" }} />
                  <div className="h-3 rounded-lg w-1/3" style={{ background: "rgba(93,104,138,0.06)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass text-center py-16 rounded-2xl"
          style={{ border: "1px solid rgba(255,255,255,0.7)" }}>
          <Calendar className="w-12 h-12 mx-auto mb-3 text-[#F7A5A5] opacity-50" />
          <p className="font-bold text-[#3a3f52]">Belum ada janji temu</p>
          <p className="text-sm text-[#5D688A]/55 mt-1">Janji temu dari pasien akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const d = parseDateStr(apt.date);
            const validDate = d !== null;
            return (
              <div key={apt.id}
                className="glass rounded-2xl p-4 sm:p-5 transition-all duration-200 tap-feedback"
                style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 2px 12px rgba(93,104,138,0.06)" }}>
                {/* Top row: date + name + status */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Date badge */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(247,165,165,0.2), rgba(255,219,182,0.3))", border: "1px solid rgba(247,165,165,0.3)" }}>
                    <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: "#F7A5A5" }}>
                      {validDate ? monthNames[d!.getMonth()] : "—"}
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-[#3a3f52] -mt-0.5">
                      {validDate ? d!.getDate() : "?"}
                    </span>
                  </div>
                  {/* Name & meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[#3a3f52] text-sm sm:text-base truncate">{apt.patientName}</h3>
                      <span
                        className={`text-[9px] sm:text-[10px] px-2 py-1 rounded-full font-semibold border shrink-0 ${statusColors[apt.status]}`}
                        style={{ background: statusBg[apt.status] }}>
                        {statusLabels[apt.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-[#5D688A]/60">
                        <Clock className="w-3 h-3 text-[#F7A5A5]" />
                        {validDate
                          ? `${fmtDateFull(apt.date)} · ${fmtTime(apt.time)}`
                          : fmtTime(apt.time) !== "-"
                            ? `— · ${fmtTime(apt.time)}`
                            : "Jadwal belum diatur"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#5D688A]/60">
                        <Phone className="w-3 h-3 text-[#FFDBB6]" />
                        <a href={`tel:${apt.patientPhone}`} className="hover:underline">{apt.patientPhone}</a>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complaint */}
                <div className="flex items-start gap-1.5 mb-3 px-1">
                  <FileText className="w-3.5 h-3.5 text-[#5D688A]/40 mt-0.5 shrink-0" />
                  <p className="text-xs text-[#5D688A]/65 leading-relaxed break-word">{apt.complaint}</p>
                </div>

                {/* Actions — full width on mobile */}
                {apt.status !== "cancelled" && apt.status !== "completed" && (
                  <div className="flex gap-2 flex-wrap">
                    {apt.status === "pending" && (
                      <button onClick={() => updateStatus(apt.id, "confirmed")}
                        disabled={updating === apt.id}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 tap-feedback"
                        style={{ background: "rgba(93,104,138,0.12)", color: "#5D688A" }}>
                        {updating === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Konfirmasi
                      </button>
                    )}
                    {(apt.status === "pending" || apt.status === "confirmed") && (
                      <>
                        <button onClick={() => updateStatus(apt.id, "completed")}
                          disabled={updating === apt.id}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 tap-feedback"
                          style={{ background: "rgba(110,198,160,0.18)", color: "#3aaa7c" }}>
                          <CheckCircle2 className="w-3 h-3" /> Selesai
                        </button>
                        <button onClick={() => updateStatus(apt.id, "cancelled")}
                          disabled={updating === apt.id}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 tap-feedback"
                          style={{ background: "rgba(247,165,165,0.2)", color: "#c0504f" }}>
                          <XCircle className="w-3 h-3" /> Batalkan
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

