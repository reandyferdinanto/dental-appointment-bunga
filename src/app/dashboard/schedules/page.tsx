"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CalendarClock, Plus, Trash2, Clock,
  ChevronLeft, ChevronRight, Loader2, Save, Settings, Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Schedule { date: string; slots: string[]; }
interface ClinicSettings {
  slotDurationMinutes: number;
  workHourStart: string; workHourEnd: string;
  breakStart: string; breakEnd: string;
}

const DEFAULT_SETTINGS: ClinicSettings = {
  slotDurationMinutes: 30, workHourStart: "08:00", workHourEnd: "16:00",
  breakStart: "12:00", breakEnd: "13:00",
};

const dayNames   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function getMonday(d: Date) {
  const date = new Date(d);
  const day  = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0,0,0,0);
  return date;
}

function formatDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function generateSlots(s: ClinicSettings): string[] {
  const slots: string[] = [];
  const dur = Math.max(s.slotDurationMinutes || 30, 5);
  const [sh=8,  sm=0]  = (s.workHourStart||"08:00").split(":").map(Number);
  const [eh=16, em=0]  = (s.workHourEnd  ||"16:00").split(":").map(Number);
  const [bsh=12,bsm=0] = (s.breakStart   ||"12:00").split(":").map(Number);
  const [beh=13,bem=0] = (s.breakEnd     ||"13:00").split(":").map(Number);
  const startMin = sh*60+sm, endMin = eh*60+em, bsMin = bsh*60+bsm, beMin = beh*60+bem;
  for (let m = startMin; m < endMin; m += dur) {
    if (m >= bsMin && m < beMin) continue;
    slots.push(`${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`);
  }
  return slots;
}

function normalizeTime(val: unknown, fallback: string): string {
  if (!val) return fallback;
  const s = String(val);
  if (/^\d{1,2}:\d{2}/.test(s)) return s.slice(0, 5);
  const m = s.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : fallback;
}

// Build a full 7-day schedule map from partial API data
function buildWeekMap(weekStart: Date, data: Schedule[]): Schedule[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateStr(d);
    const found = data.find(s => s.date === dateStr);
    return found ?? { date: dateStr, slots: [] };
  });
}

export default function SchedulesPage() {
  const [weekStart, setWeekStart]       = useState(() => getMonday(new Date()));
  const [schedules, setSchedules]       = useState<Schedule[]>(() => buildWeekMap(getMonday(new Date()), []));
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState<string|null>(null);
  const [selectedDate, setSelectedDate] = useState<string|null>(null);
  const [editingSlots, setEditingSlots] = useState<string[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_SETTINGS);
  // Derive timeSlots directly from clinicSettings — always in sync, never empty
  const timeSlots = generateSlots(clinicSettings);
  // Track if settings have been loaded to show correct slot count in info bar
  const settingsLoadedRef = useRef(false);

  // Load settings once on mount
  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === "object" && data.workHourStart) {
          setClinicSettings({
            slotDurationMinutes: Number(data.slotDurationMinutes) || 30,
            workHourStart: normalizeTime(data.workHourStart, "08:00"),
            workHourEnd:   normalizeTime(data.workHourEnd,   "16:00"),
            breakStart:    normalizeTime(data.breakStart,    "12:00"),
            breakEnd:      normalizeTime(data.breakEnd,      "13:00"),
          });
          settingsLoadedRef.current = true;
        }
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  const fetchSchedules = useCallback(async (ws: Date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules?week=${formatDateStr(ws)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // Always build a full 7-day grid regardless of what API returns
        setSchedules(buildWeekMap(ws, Array.isArray(data) ? data : []));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    setSchedules(buildWeekMap(weekStart, []));  // show empty skeleton immediately
    fetchSchedules(weekStart);
  }, [weekStart, fetchSchedules]);

  function startEditing(date: string) {
    const existing = schedules.find(s => s.date === date);
    setSelectedDate(date);
    setEditingSlots(existing?.slots ? [...existing.slots] : []);
  }

  function toggleSlot(slot: string) {
    setEditingSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  }

  function selectAll() { setEditingSlots([...timeSlots]); }
  function clearAll()  { setEditingSlots([]); }

  async function saveSchedule() {
    if (!selectedDate) return;
    setSaving(selectedDate);
    // Optimistic update — update local state immediately
    const newSlots = [...editingSlots].sort();
    setSchedules(prev =>
      prev.map(s => s.date === selectedDate ? { ...s, slots: newSlots } : s)
    );
    setSelectedDate(null);
    try {
      await fetch("/api/schedules", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, slots: newSlots }),
      });
    } catch (err) {
      console.error(err);
      // On error, re-fetch to restore correct state
      fetchSchedules(weekStart);
    }
    setSaving(null);
  }

  async function clearSchedule(date: string) {
    setSaving(date);
    // Optimistic update — clear slots locally immediately
    setSchedules(prev =>
      prev.map(s => s.date === date ? { ...s, slots: [] } : s)
    );
    try {
      await fetch("/api/schedules", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, slots: [] }),
      });
    } catch (err) {
      console.error(err);
      // On error, re-fetch to restore correct state
      fetchSchedules(weekStart);
    }
    setSaving(null);
  }

  const prevWeek = () => {
    const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d);
  };
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate()+6);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3a3f52] flex items-center gap-2">
            <CalendarClock className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: "#F7A5A5" }} />
            Kelola Jadwal Praktik
          </h1>
          <p className="text-xs sm:text-sm text-[#5D688A]/65 mt-1">Atur slot waktu yang tersedia untuk pasien</p>
        </div>
        <Link href="/dashboard/settings"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
          style={{ background: "rgba(93,104,138,0.1)", color: "#5D688A", border: "1px solid rgba(93,104,138,0.15)" }}>
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Atur Durasi</span>
          <span className="sm:hidden">{clinicSettings.slotDurationMinutes}mnt</span>
        </Link>
      </div>

      {/* Slot duration info */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl mb-5 text-xs font-semibold"
        style={{ background: "rgba(247,165,165,0.1)", border: "1px solid rgba(247,165,165,0.2)", color: "#5D688A" }}>
        <Sparkles className="w-3.5 h-3.5" style={{ color: "#F7A5A5" }} />
        Durasi slot: <strong>{clinicSettings.slotDurationMinutes} menit</strong>
        &nbsp;·&nbsp; {clinicSettings.workHourStart}–{clinicSettings.workHourEnd}
        &nbsp;·&nbsp; Istirahat {clinicSettings.breakStart}–{clinicSettings.breakEnd}
        &nbsp;·&nbsp; <strong>{timeSlots.length} slot/hari</strong>
      </div>

      {/* Week Navigation */}
      <div className="glass flex items-center justify-between mb-5 rounded-2xl p-3 sm:p-4"
        style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 4px 20px rgba(93,104,138,0.08)" }}>
        <button onClick={prevWeek} className="p-2.5 rounded-xl hover:bg-white/60 text-[#5D688A] transition-all tap-feedback">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-[#3a3f52] text-xs sm:text-base text-center leading-snug">
          {weekStart.getDate()} {monthNames[weekStart.getMonth()]} — {weekEnd.getDate()} {monthNames[weekEnd.getMonth()]} {weekEnd.getFullYear()}
        </h2>
        <button onClick={nextWeek} className="p-2.5 rounded-xl hover:bg-white/60 text-[#5D688A] transition-all tap-feedback">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slot Editor Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(58,63,82,0.45)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedDate(null)}>
          <div className="modal-sheet glass sm:rounded-3xl max-w-lg w-full overflow-y-auto animate-slide-up"
            style={{ border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 20px 60px rgba(93,104,138,0.2)", padding: "20px 20px 0 20px" }}
            onClick={e => e.stopPropagation()}>

            <div className="sm:hidden flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(93,104,138,0.25)" }} />
            </div>

            <div className="flex items-start justify-between mb-1">
              <h3 className="font-bold text-lg text-[#3a3f52]">Edit Jadwal</h3>
              <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                style={{ background: "rgba(247,165,165,0.15)", color: "#5D688A" }}>
                {clinicSettings.slotDurationMinutes} mnt/slot
              </span>
            </div>
            <p className="text-sm text-[#5D688A]/65 mb-4">
              {(() => {
                const [y, mo, day] = selectedDate.split("-").map(Number);
                const d = new Date(y, mo-1, day);
                return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
              })()}
            </p>

            {/* Quick actions */}
            <div className="flex gap-2 mb-3">
              <button onClick={selectAll}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ background: "rgba(110,198,160,0.15)", color: "#3aaa7c", border: "1px solid rgba(110,198,160,0.3)" }}>
                ✓ Pilih Semua ({timeSlots.length})
              </button>
              <button onClick={clearAll}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ background: "rgba(247,165,165,0.15)", color: "#c0504f", border: "1px solid rgba(247,165,165,0.3)" }}>
                ✕ Kosongkan
              </button>
            </div>

            {timeSlots.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#5D688A]/60">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Belum ada slot tersedia.<br />
                <Link href="/dashboard/settings" className="underline font-semibold" style={{ color: "#F7A5A5" }}>
                  Atur jam kerja di Pengaturan
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-[#5D688A]/60 mb-2">
                  Pilih slot waktu tersedia ({timeSlots.length} slot):
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
                  {timeSlots.map(slot => (
                    <button key={slot} onClick={() => toggleSlot(slot)}
                      className="py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.04] active:scale-95 tap-feedback"
                      style={editingSlots.includes(slot) ? {
                        background: "linear-gradient(135deg,#F7A5A5,#5D688A)",
                        color: "white", boxShadow: "0 4px 12px rgba(247,165,165,0.4)"
                      } : {
                        background: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(93,104,138,0.15)", color: "#5D688A"
                      }}>
                      {slot}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="sticky bottom-0 flex gap-3 py-4"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom,8px),8px)", background: "linear-gradient(to bottom,rgba(255,242,239,0) 0%,rgba(255,242,239,0.97) 30%)" }}>
              <button onClick={() => setSelectedDate(null)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-[#5D688A] transition-all active:scale-95 tap-feedback"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(93,104,138,0.15)" }}>
                Batal
              </button>
              <button onClick={saveSchedule} disabled={!!saving}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 tap-feedback"
                style={{ background: "linear-gradient(135deg,#5D688A,#7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.3)" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan ({editingSlots.length} slot)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Week Grid — always 7 days */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 animate-pulse"
              style={{ border: "1px solid rgba(255,255,255,0.65)" }}>
              <div className="h-4 rounded-lg w-16 mb-3" style={{ background: "rgba(93,104,138,0.08)" }} />
              <div className="space-y-2">
                <div className="h-6 rounded-xl" style={{ background: "rgba(93,104,138,0.06)" }} />
                <div className="h-6 rounded-xl" style={{ background: "rgba(93,104,138,0.04)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {schedules.map((schedule) => {
            const [sy, smo, sd] = schedule.date.split("-").map(Number);
            const d = new Date(sy, smo-1, sd);
            const isSunday = d.getDay() === 0;
            const isToday  = schedule.date === formatDateStr(new Date());

            return (
              <div key={schedule.date}
                className={`glass rounded-2xl p-4 transition-all ${isSunday ? "opacity-40" : ""}`}
                style={isToday ? {
                  border: "1.5px solid rgba(247,165,165,0.5)",
                  background: "rgba(255,219,182,0.2)"
                } : { border: "1px solid rgba(255,255,255,0.7)" }}>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-xs" style={{ color: isToday ? "#F7A5A5" : "#3a3f52" }}>
                      {dayNames[d.getDay()]}
                    </p>
                    <p className="text-[10px] text-[#5D688A]/50">
                      {d.getDate()} {monthNames[d.getMonth()]}
                    </p>
                  </div>
                  {!isSunday && (
                    <button onClick={() => startEditing(schedule.date)}
                      className="p-1.5 rounded-xl transition-all hover:scale-110 tap-feedback"
                      style={{ background: "rgba(247,165,165,0.15)", color: "#F7A5A5" }}>
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {schedule.slots.length > 0 ? (
                  <div className="space-y-1">
                    {[...schedule.slots].sort().map((slot) => (
                      <div key={slot}
                        className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold"
                        style={{ background: "rgba(247,165,165,0.15)", color: "#5D688A", border: "1px solid rgba(247,165,165,0.2)" }}>
                        <Clock className="w-2.5 h-2.5 text-[#F7A5A5]" />
                        {slot}
                      </div>
                    ))}
                    <button onClick={() => clearSchedule(schedule.date)} disabled={saving === schedule.date}
                      className="w-full mt-1 flex items-center justify-center gap-1 py-1 rounded-xl text-[10px] font-medium transition-all hover:bg-white/60"
                      style={{ color: "#F7A5A5" }}>
                      {saving === schedule.date
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <><Trash2 className="w-2.5 h-2.5" /> Hapus semua</>}
                    </button>
                  </div>
                ) : !isSunday ? (
                  <button onClick={() => startEditing(schedule.date)}
                    className="w-full py-3 rounded-2xl text-xs font-medium transition-all hover:bg-white/60"
                    style={{ border: "1.5px dashed rgba(93,104,138,0.2)", color: "rgba(93,104,138,0.6)" }}>
                    + Tambah slot
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
