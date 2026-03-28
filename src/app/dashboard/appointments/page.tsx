"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  NeuButton,
  NeuCard,
  NeuChip,
  NeuInput,
} from "@/components/ui/neumorphism";

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
  pending:   "border-[#FEC3C3] text-[#c77b7b]",
  confirmed: "border-[#5D688A]/30 text-[#5D688A]",
  completed: "border-[#F7D7D7] text-[#bb7f7f]",
  cancelled: "border-[#FDACAC]/50 text-[#bb6868]",
};

const statusBg: Record<string, string> = {
  pending:   "rgba(254,195,195,0.35)",
  confirmed: "rgba(93,104,138,0.10)",
  completed: "rgba(247,215,215,0.70)",
  cancelled: "rgba(253,172,172,0.20)",
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

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void fetchAppointments();
    }, 0);
    return () => window.clearTimeout(id);
  }, [fetchAppointments]);

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
          <NeuInput type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pasien..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#5D688A]/50 shrink-0" />
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <NeuButton key={s} onClick={() => setFilter(s)}
              size="sm"
              variant={filter === s ? "primary" : "secondary"}
              className="tap-feedback">
              {s === "all" ? "Semua" : statusLabels[s]}
            </NeuButton>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <NeuCard key={i} className="animate-pulse rounded-2xl p-5">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl" style={{ background: "rgba(93,104,138,0.08)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded-lg w-1/4" style={{ background: "rgba(93,104,138,0.08)" }} />
                  <div className="h-3 rounded-lg w-1/3" style={{ background: "rgba(93,104,138,0.06)" }} />
                </div>
              </div>
            </NeuCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <NeuCard className="rounded-2xl py-16 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-[#FDACAC] opacity-50" />
          <p className="font-bold text-[#3a3f52]">Belum ada janji temu</p>
          <p className="text-sm text-[#5D688A]/55 mt-1">Janji temu dari pasien akan muncul di sini</p>
        </NeuCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const d = parseDateStr(apt.date);
            const validDate = d !== null;
            return (
              <NeuCard key={apt.id}
                className="neu-card-hover rounded-2xl p-4 transition-all duration-200 tap-feedback sm:p-5">
                {/* Top row: date + name + status */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Date badge */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
                    style={{ background: "#e6e7ee", border: "1px solid rgba(255,255,255,0.52)", boxShadow: "4px 4px 8px rgba(163,177,198,0.16), -4px -4px 8px rgba(255,255,255,0.34)" }}>
                    <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: "#FDACAC" }}>
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
                      <NeuChip
                        className={`shrink-0 border px-2 py-1 text-[9px] sm:text-[10px] ${statusColors[apt.status]}`}
                        style={{ background: statusBg[apt.status] }}>
                        {statusLabels[apt.status]}
                      </NeuChip>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-[#5D688A]/60">
                        <Clock className="w-3 h-3 text-[#FDACAC]" />
                        {validDate
                          ? `${fmtDateFull(apt.date)} · ${fmtTime(apt.time)}`
                          : fmtTime(apt.time) !== "-"
                            ? `— · ${fmtTime(apt.time)}`
                            : "Jadwal belum diatur"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#5D688A]/60">
                        <Phone className="w-3 h-3 text-[#FEC3C3]" />
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
                      <NeuButton onClick={() => updateStatus(apt.id, "confirmed")}
                        disabled={updating === apt.id}
                        size="sm"
                        className="tap-feedback flex-1 sm:flex-none">
                        {updating === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Konfirmasi
                      </NeuButton>
                    )}
                    {(apt.status === "pending" || apt.status === "confirmed") && (
                      <>
                        <NeuButton onClick={() => updateStatus(apt.id, "completed")}
                          disabled={updating === apt.id}
                          variant="success"
                          size="sm"
                          className="tap-feedback flex-1 sm:flex-none">
                          <CheckCircle2 className="w-3 h-3" /> Selesai
                        </NeuButton>
                        <NeuButton onClick={() => updateStatus(apt.id, "cancelled")}
                          disabled={updating === apt.id}
                          variant="danger"
                          size="sm"
                          className="tap-feedback flex-1 sm:flex-none">
                          <XCircle className="w-3 h-3" /> Batalkan
                        </NeuButton>
                      </>
                    )}
                  </div>
                )}
              </NeuCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

