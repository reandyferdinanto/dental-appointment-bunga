"use client";

import { useState, useEffect } from "react";
import {
  CalendarClock,
  Plus,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
} from "lucide-react";

interface Schedule {
  date: string;
  slots: string[];
}

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00",
];

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SchedulesPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSlots, setEditingSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchSchedules();
  }, [weekStart]);

  async function fetchSchedules() {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules?week=${formatDateStr(weekStart)}`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function startEditing(date: string) {
    const existing = schedules.find((s) => s.date === date);
    setSelectedDate(date);
    setEditingSlots(existing?.slots || []);
  }

  function toggleSlot(slot: string) {
    setEditingSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }

  async function saveSchedule() {
    if (!selectedDate) return;
    setSaving(selectedDate);
    try {
      await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, slots: editingSlots }),
      });
      await fetchSchedules();
      setSelectedDate(null);
    } catch (err) {
      console.error(err);
    }
    setSaving(null);
  }

  async function clearSchedule(date: string) {
    setSaving(date);
    try {
      await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, slots: [] }),
      });
      await fetchSchedules();
    } catch (err) {
      console.error(err);
    }
    setSaving(null);
  }

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="pb-4">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#3a3f52] flex items-center gap-2">
          <CalendarClock className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: "#F7A5A5" }} />
          Kelola Jadwal Praktik
        </h1>
        <p className="text-xs sm:text-sm text-[#5D688A]/65 mt-1">Atur slot waktu yang tersedia untuk pasien</p>
      </div>

      {/* Week Navigation */}
      <div className="glass flex items-center justify-between mb-6 rounded-2xl p-3 sm:p-4"
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

      {/* Slot Editor Modal — bottom sheet on mobile */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(58,63,82,0.45)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedDate(null)}>
          <div
            className="modal-sheet glass sm:rounded-3xl max-w-lg w-full overflow-y-auto animate-slide-up"
            style={{
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 20px 60px rgba(93,104,138,0.2)",
              padding: "20px 20px 0 20px",
            }}
            onClick={(e) => e.stopPropagation()}>

            {/* Drag handle */}
            <div className="sm:hidden flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(93,104,138,0.25)" }} />
            </div>

            <h3 className="font-bold text-lg text-[#3a3f52] mb-1">Edit Jadwal</h3>
            <p className="text-sm text-[#5D688A]/65 mb-4">
              {(() => {
                const [y, mo, day] = selectedDate.split("-").map(Number);
                const d = new Date(y, mo - 1, day);
                return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
              })()}
            </p>

            <p className="text-xs font-semibold text-[#5D688A]/60 mb-3">Pilih slot waktu yang tersedia:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
              {timeSlots.map((slot) => (
                <button key={slot} onClick={() => toggleSlot(slot)}
                  className="py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.04] active:scale-95 tap-feedback"
                  style={editingSlots.includes(slot) ? {
                    background: "linear-gradient(135deg, #F7A5A5, #5D688A)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(247,165,165,0.4)"
                  } : {
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(93,104,138,0.15)",
                    color: "#5D688A"
                  }}>
                  {slot}
                </button>
              ))}
            </div>

            {/* Sticky action buttons — stick to bottom of sheet, above mobile nav */}
            <div
              className="sticky bottom-0 flex gap-3 py-4 bg-transparent"
              style={{
                // Extra bottom padding = safe-area-inset-bottom so buttons sit above iOS home bar
                paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)",
                background: "linear-gradient(to bottom, rgba(255,242,239,0) 0%, rgba(255,242,239,0.97) 30%)",
              }}>
              <button onClick={() => setSelectedDate(null)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-[#5D688A] transition-all active:scale-95 tap-feedback"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(93,104,138,0.15)" }}>
                Batal
              </button>
              <button onClick={saveSchedule} disabled={!!saving}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 tap-feedback"
                style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.3)" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan ({editingSlots.length} slot)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Week Grid */}
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
          {schedules.map((schedule, idx) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + idx);
            const dateStr = formatDateStr(d);
            const isSunday = d.getDay() === 0;
            const isToday = dateStr === formatDateStr(new Date());

            return (
              <div key={dateStr}
                className={`glass rounded-2xl p-4 transition-all ${isSunday ? "opacity-40" : ""}`}
                style={isToday ? {
                  border: "1.5px solid rgba(247,165,165,0.5)",
                  background: "rgba(255,219,182,0.2)"
                } : {
                  border: "1px solid rgba(255,255,255,0.7)"
                }}>
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
                    <button onClick={() => startEditing(dateStr)}
                      className="p-1.5 rounded-xl transition-all hover:scale-110"
                      style={{ background: "rgba(247,165,165,0.15)", color: "#F7A5A5" }}>
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {schedule.slots.length > 0 ? (
                  <div className="space-y-1">
                    {schedule.slots.sort().map((slot) => (
                      <div key={slot}
                        className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold"
                        style={{ background: "rgba(247,165,165,0.15)", color: "#5D688A", border: "1px solid rgba(247,165,165,0.2)" }}>
                        <Clock className="w-2.5 h-2.5 text-[#F7A5A5]" />
                        {slot}
                      </div>
                    ))}
                    <button onClick={() => clearSchedule(dateStr)} disabled={saving === dateStr}
                      className="w-full mt-1 flex items-center justify-center gap-1 py-1 rounded-xl text-[10px] font-medium transition-all hover:bg-white/60"
                      style={{ color: "#F7A5A5" }}>
                      {saving === dateStr
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <><Trash2 className="w-2.5 h-2.5" /> Hapus semua</>}
                    </button>
                  </div>
                ) : !isSunday ? (
                  <button onClick={() => startEditing(dateStr)}
                    className="w-full py-3 rounded-2xl text-xs font-medium transition-all hover:bg-white/60"
                    style={{ border: "1.5px dashed rgba(93,104,138,0.2)", color: "#5D688A]/60" }}>
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
