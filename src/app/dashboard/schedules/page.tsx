"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CalendarClock,
  Plus,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { NeuButton, NeuCard, NeuChip } from "@/components/ui/neumorphism";

interface Schedule {
  date: string;
  slots: string[];
}

interface ClinicSettings {
  slotDurationMinutes: number;
  workHourStart: string;
  workHourEnd: string;
  breakStart: string;
  breakEnd: string;
}

const DEFAULT_SETTINGS: ClinicSettings = {
  slotDurationMinutes: 30,
  workHourStart: "08:00",
  workHourEnd: "16:00",
  breakStart: "12:00",
  breakEnd: "13:00",
};

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
  "Agustus", "September", "Oktober", "November", "Desember",
];

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateSlots(s: ClinicSettings): string[] {
  const slots: string[] = [];
  const dur = Math.max(s.slotDurationMinutes || 30, 5);
  const [sh = 8, sm = 0] = (s.workHourStart || "08:00").split(":").map(Number);
  const [eh = 16, em = 0] = (s.workHourEnd || "16:00").split(":").map(Number);
  const [bsh = 12, bsm = 0] = (s.breakStart || "12:00").split(":").map(Number);
  const [beh = 13, bem = 0] = (s.breakEnd || "13:00").split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const bsMin = bsh * 60 + bsm;
  const beMin = beh * 60 + bem;

  for (let m = startMin; m < endMin; m += dur) {
    if (m >= bsMin && m < beMin) continue;
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
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

function buildWeekMap(weekStart: Date, data: Schedule[]): Schedule[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateStr(d);
    const found = data.find((s) => s.date === dateStr);
    return found ?? { date: dateStr, slots: [] };
  });
}

export default function SchedulesPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>(() => buildWeekMap(getMonday(new Date()), []));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSlots, setEditingSlots] = useState<string[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_SETTINGS);
  const timeSlots = generateSlots(clinicSettings);
  const settingsLoadedRef = useRef(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object" && data.workHourStart) {
          setClinicSettings({
            slotDurationMinutes: Number(data.slotDurationMinutes) || 30,
            workHourStart: normalizeTime(data.workHourStart, "08:00"),
            workHourEnd: normalizeTime(data.workHourEnd, "16:00"),
            breakStart: normalizeTime(data.breakStart, "12:00"),
            breakEnd: normalizeTime(data.breakEnd, "13:00"),
          });
          settingsLoadedRef.current = true;
        }
      })
      .catch(() => {});
  }, []);

  const fetchSchedules = useCallback(async (ws: Date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules?week=${formatDateStr(ws)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSchedules(buildWeekMap(ws, Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSchedules(buildWeekMap(weekStart, []));
      void fetchSchedules(weekStart);
    }, 0);
    return () => window.clearTimeout(id);
  }, [weekStart, fetchSchedules]);

  function startEditing(date: string) {
    const existing = schedules.find((s) => s.date === date);
    setSelectedDate(date);
    setEditingSlots(existing?.slots ? [...existing.slots] : []);
  }

  function toggleSlot(slot: string) {
    setEditingSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }

  function selectAll() {
    setEditingSlots([...timeSlots]);
  }

  function clearAll() {
    setEditingSlots([]);
  }

  async function saveSchedule() {
    if (!selectedDate) return;
    setSaveError("");
    setSaving(selectedDate);
    const newSlots = [...editingSlots].sort();
    setSchedules((prev) => prev.map((s) => (s.date === selectedDate ? { ...s, slots: newSlots } : s)));
    setSelectedDate(null);

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, slots: newSlots }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal menyimpan jadwal");
      }
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan jadwal");
      void fetchSchedules(weekStart);
    }

    setSaving(null);
  }

  async function clearSchedule(date: string) {
    setSaveError("");
    setSaving(date);
    setSchedules((prev) => prev.map((s) => (s.date === date ? { ...s, slots: [] } : s)));

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, slots: [] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal menghapus jadwal");
      }
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Gagal menghapus jadwal");
      void fetchSchedules(weekStart);
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
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#3a3f52] sm:text-2xl">
            <CalendarClock className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: "#FDACAC" }} />
            Kelola Jadwal Praktik
          </h1>
          <p className="mt-1 text-xs text-[#5D688A]/65 sm:text-sm">
            Atur slot waktu yang tersedia untuk pasien
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="btn-neu-secondary flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:scale-[1.02]"
          style={{ color: "#4e6785" }}
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Atur Durasi</span>
          <span className="sm:hidden">{clinicSettings.slotDurationMinutes}mnt</span>
        </Link>
      </div>

      <NeuCard inset className="mb-5 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold" style={{ color: "#5D688A" }}>
        <Sparkles className="h-3.5 w-3.5" style={{ color: "#FDACAC" }} />
        Durasi slot: <strong>{clinicSettings.slotDurationMinutes} menit</strong>
        &nbsp;·&nbsp; {clinicSettings.workHourStart}-{clinicSettings.workHourEnd}
        &nbsp;·&nbsp; Istirahat {clinicSettings.breakStart}-{clinicSettings.breakEnd}
        &nbsp;·&nbsp; <strong>{timeSlots.length} slot/hari</strong>
      </NeuCard>

      <NeuCard className="mb-5 flex items-center justify-between rounded-2xl p-3 sm:p-4">
        <NeuButton onClick={prevWeek} size="sm" className="rounded-xl px-2.5 py-2.5 text-[#4e6785] tap-feedback">
          <ChevronLeft className="h-5 w-5" />
        </NeuButton>
        <h2 className="text-center text-xs font-bold leading-snug text-[#3a3f52] sm:text-base">
          {weekStart.getDate()} {monthNames[weekStart.getMonth()]} - {weekEnd.getDate()} {monthNames[weekEnd.getMonth()]} {weekEnd.getFullYear()}
        </h2>
        <NeuButton onClick={nextWeek} size="sm" className="rounded-xl px-2.5 py-2.5 text-[#4e6785] tap-feedback">
          <ChevronRight className="h-5 w-5" />
        </NeuButton>
      </NeuCard>

      {saveError && (
        <NeuCard className="mb-5 rounded-2xl border border-[#FDACAC]/40 px-4 py-3 text-sm font-semibold text-[#bb6868]">
          {saveError}
        </NeuCard>
      )}

      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          style={{ background: "rgba(58,63,82,0.45)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedDate(null)}
        >
          <NeuCard
            className="modal-sheet max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 animate-slide-up sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full" style={{ background: "rgba(93,104,138,0.25)" }} />
            </div>

            <div className="mb-1 flex items-start justify-between">
              <h3 className="text-lg font-bold text-[#3a3f52]">Edit Jadwal</h3>
              <NeuChip className="px-2 py-1" style={{ color: "#4e6785" }}>
                {clinicSettings.slotDurationMinutes} mnt/slot
              </NeuChip>
            </div>
            <p className="mb-4 text-sm text-[#5D688A]/65">
              {(() => {
                const [y, mo, day] = selectedDate.split("-").map(Number);
                const d = new Date(y, mo - 1, day);
                return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
              })()}
            </p>

            <div className="mb-3 flex gap-2">
              <NeuButton onClick={selectAll} variant="success" size="sm" className="flex-1">
                Pilih Semua ({timeSlots.length})
              </NeuButton>
              <NeuButton onClick={clearAll} variant="danger" size="sm" className="flex-1">
                Kosongkan
              </NeuButton>
            </div>

            {timeSlots.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#5D688A]/60">
                <Clock className="mx-auto mb-2 h-8 w-8 opacity-30" />
                Belum ada slot tersedia.
                <br />
                <Link href="/dashboard/settings" className="font-semibold underline" style={{ color: "#FDACAC" }}>
                  Atur jam kerja di Pengaturan
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs font-semibold text-[#5D688A]/60">
                  Pilih slot waktu tersedia ({timeSlots.length} slot):
                </p>
                <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {timeSlots.map((slot) => (
                    <NeuButton
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      variant={editingSlots.includes(slot) ? "primary" : "secondary"}
                      size="md"
                      className="w-full justify-center py-3 text-sm tap-feedback"
                    >
                      {slot}
                    </NeuButton>
                  ))}
                </div>
              </>
            )}

            <div
              className="sticky bottom-0 flex gap-3 py-4"
              style={{
                paddingBottom: "max(env(safe-area-inset-bottom,8px),8px)",
                background: "linear-gradient(to bottom,rgba(255,242,239,0) 0%,rgba(255,242,239,0.97) 30%)",
              }}
            >
              <NeuButton onClick={() => setSelectedDate(null)} variant="secondary" size="lg" className="flex-1 tap-feedback">
                Batal
              </NeuButton>
              <NeuButton onClick={saveSchedule} disabled={!!saving} variant="primary" size="lg" className="flex-1 hover:scale-[1.01] tap-feedback">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan ({editingSlots.length} slot)
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {[...Array(7)].map((_, i) => (
            <NeuCard key={i} className="animate-pulse rounded-2xl p-4">
              <div className="mb-3 h-4 w-16 rounded-lg" style={{ background: "rgba(93,104,138,0.08)" }} />
              <div className="space-y-2">
                <div className="h-6 rounded-xl" style={{ background: "rgba(93,104,138,0.06)" }} />
                <div className="h-6 rounded-xl" style={{ background: "rgba(93,104,138,0.04)" }} />
              </div>
            </NeuCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {schedules.map((schedule) => {
            const [sy, smo, sd] = schedule.date.split("-").map(Number);
            const d = new Date(sy, smo - 1, sd);
            const isSunday = d.getDay() === 0;
            const isToday = schedule.date === formatDateStr(new Date());

            return (
              <NeuCard
                key={schedule.date}
                className={`rounded-2xl p-4 transition-all ${isSunday ? "opacity-40" : ""}`}
                style={
                  isToday
                    ? {
                        border: "1.5px solid rgba(253,172,172,0.5)",
                        background: "rgba(254,195,195,0.2)",
                      }
                    : { border: "1px solid rgba(255,255,255,0.7)" }
                }
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold" style={{ color: isToday ? "#FDACAC" : "#3a3f52" }}>
                      {dayNames[d.getDay()]}
                    </p>
                    <p className="text-[10px] text-[#5D688A]/50">
                      {d.getDate()} {monthNames[d.getMonth()]}
                    </p>
                  </div>
                  {!isSunday ? (
                    <NeuButton
                      onClick={() => startEditing(schedule.date)}
                      size="sm"
                      className="rounded-xl px-1.5 py-1.5 tap-feedback"
                      style={{ background: "rgba(253,172,172,0.15)", color: "#FDACAC" }}
                    >
                      <Plus className="h-4 w-4" />
                    </NeuButton>
                  ) : null}
                </div>

                {schedule.slots.length > 0 ? (
                  <div className="space-y-1">
                    {[...schedule.slots].sort().map((slot) => (
                      <NeuChip
                        key={slot}
                        className="flex items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-semibold"
                        style={{ background: "rgba(253,172,172,0.15)", color: "#5D688A", border: "1px solid rgba(253,172,172,0.2)" }}
                      >
                        <Clock className="h-2.5 w-2.5 text-[#FDACAC]" />
                        {slot}
                      </NeuChip>
                    ))}
                    <NeuButton
                      onClick={() => clearSchedule(schedule.date)}
                      disabled={saving === schedule.date}
                      variant="danger"
                      size="sm"
                      className="mt-1 w-full text-[10px] font-medium"
                    >
                      {saving === schedule.date ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-2.5 w-2.5" /> Hapus semua
                        </>
                      )}
                    </NeuButton>
                  </div>
                ) : !isSunday ? (
                  <NeuButton
                    onClick={() => startEditing(schedule.date)}
                    variant="secondary"
                    size="md"
                    className="w-full border border-dashed border-[#5D688A]/20 py-3 text-xs font-medium text-[#5D688A]/70 shadow-none"
                  >
                    + Tambah slot
                  </NeuButton>
                ) : null}
              </NeuCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
