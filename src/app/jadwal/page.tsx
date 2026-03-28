"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import TeethLoader from "@/components/ui/TeethLoader";
import { ChevronLeft, ChevronRight, Clock, CalendarDays, Calendar } from "lucide-react";
import { NeuButton, NeuCard, NeuChip } from "@/components/ui/neumorphism";

interface Schedule {
  date: string;
  slots: string[];
}

const dayNamesShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const dayNamesFull = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
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

export default function JadwalPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedules() {
      setLoading(true);
      try {
        const res = await fetch(`/api/schedules?week=${formatDateStr(weekStart)}`);
        if (res.ok) {
          const data = await res.json();
          setSchedules(Array.isArray(data) ? data : []);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchSchedules();
  }, [weekStart]);

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

  const todayStr = formatDateStr(new Date());

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Navbar />

      <main className="flex-1 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold chip-neu mb-4"
              style={{ color: "#4e6785" }}>
              <CalendarDays className="w-3.5 h-3.5" />
              Jadwal Praktik
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#3a3f52]">
              Jadwal Praktik Mingguan
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#5D688A]/65">
              Lihat ketersediaan jadwal drg. Bunga Maureen
            </p>
          </div>

          {/* Week Navigation */}
          <NeuCard className="mb-5 flex items-center justify-between rounded-2xl p-3 sm:p-4">
            <NeuButton onClick={prevWeek}
              size="sm" className="rounded-xl px-2.5 py-2.5 text-[#4e6785] tap-feedback">
              <ChevronLeft className="w-5 h-5" />
            </NeuButton>
            <div className="text-center">
              <h2 className="font-bold text-[#3a3f52] text-sm sm:text-base">
                {weekStart.getDate()} {monthNames[weekStart.getMonth()]} - {weekEnd.getDate()} {monthNames[weekEnd.getMonth()]}
              </h2>
              <p className="text-xs text-[#5D688A]/50">{weekEnd.getFullYear()}</p>
            </div>
            <NeuButton onClick={nextWeek}
              size="sm" className="rounded-xl px-2.5 py-2.5 text-[#4e6785] tap-feedback">
              <ChevronRight className="w-5 h-5" />
            </NeuButton>
          </NeuCard>

          {/* Schedule Grid */}
          {loading ? (
            <TeethLoader message="Tunggu yaa, kami cek terlebih dahulu" />
          ) : (
            <>
              {/* Mobile: scrollable horizontal row */}
              <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory sm:hidden" style={{ scrollbarWidth: "none" }}>
                {schedules.map((schedule, idx) => {
                  const d = new Date(weekStart);
                  d.setDate(d.getDate() + idx);
                  const isToday = formatDateStr(d) === todayStr;
                  const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <NeuCard key={schedule.date}
                      className={`snap-start shrink-0 w-44 rounded-2xl p-4 transition-all ${isPast ? "opacity-50" : ""}`}
                      style={isToday ? {
                        border: "1.5px solid rgba(253,172,172,0.55)",
                        boxShadow: "4px 4px 8px rgba(163,177,198,0.16), -4px -4px 8px rgba(255,255,255,0.34)",
                        background: "#e6e7ee"
                      } : {
                        border: "1px solid rgba(255,255,255,0.7)"
                      }}>
                      <div className="mb-3">
                        <p className="font-bold text-sm" style={{ color: isToday ? "#FDACAC" : "#3a3f52" }}>
                          {dayNamesFull[d.getDay()]}
                        </p>
                        <p className="text-xs text-[#5D688A]/55">
                          {d.getDate()} {monthNames[d.getMonth()]}
                        </p>
                        {isToday && (
                          <NeuChip className="mt-1.5 px-2 py-0.5 text-[9px]" style={{ color: "#5D688A" }}>
                            Hari ini
                          </NeuChip>
                        )}
                      </div>
                      {schedule.slots.length > 0 ? (
                        <div className="space-y-1.5">
                          {schedule.slots.sort().map((slot) => (
                            <NeuChip key={slot}
                              className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                              style={{ color: "#5D688A" }}>
                              <Clock className="w-3 h-3 text-[#FDACAC] shrink-0" />
                              {slot}
                            </NeuChip>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#5D688A]/35 italic">Tidak ada jadwal</p>
                      )}
                    </NeuCard>
                  );
                })}
              </div>

              {/* Desktop: grid */}
              <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {schedules.map((schedule, idx) => {
                  const d = new Date(weekStart);
                  d.setDate(d.getDate() + idx);
                  const isToday = formatDateStr(d) === todayStr;
                  const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <NeuCard key={schedule.date}
                      className={`rounded-2xl p-4 transition-all ${isPast ? "opacity-45" : ""}`}
                      style={isToday ? {
                        border: "1.5px solid rgba(253,172,172,0.55)",
                        boxShadow: "4px 4px 8px rgba(163,177,198,0.16), -4px -4px 8px rgba(255,255,255,0.34)",
                        background: "#e6e7ee"
                      } : {
                        border: "1px solid rgba(255,255,255,0.7)"
                      }}>
                      <div className="mb-3">
                        <p className="font-bold text-sm" style={{ color: isToday ? "#FDACAC" : "#3a3f52" }}>
                          {dayNamesShort[d.getDay()]}
                        </p>
                        <p className="text-xs text-[#5D688A]/55">
                          {d.getDate()} {monthNames[d.getMonth()]}
                        </p>
                        {isToday && (
                          <NeuChip className="mt-1 px-2.5 py-0.5 text-[9px]" style={{ color: "#5D688A" }}>
                            Hari ini
                          </NeuChip>
                        )}
                      </div>
                      {schedule.slots.length > 0 ? (
                        <div className="space-y-1.5">
                          {schedule.slots.sort().map((slot) => (
                            <NeuChip key={slot}
                              className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                              style={{ color: "#5D688A" }}>
                              <Clock className="w-3 h-3 text-[#FDACAC]" />
                              {slot}
                            </NeuChip>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#5D688A]/40 italic">Tidak ada jadwal</p>
                      )}
                    </NeuCard>
                  );
                })}
              </div>
            </>
          )}

          {/* Info + CTA */}
          <div className="mt-6 space-y-3">
            <NeuCard inset className="rounded-2xl p-4">
              <p className="text-sm text-[#4e6785]">
                <strong>Tips:</strong> Slot yang ditampilkan adalah waktu yang masih tersedia.
                Segera lakukan booking sebelum slot diambil pasien lain!
              </p>
            </NeuCard>
            <Link href="/booking"
              className="btn-neu-primary flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 tap-feedback">
              <Calendar className="w-4 h-4" />
              Buat Janji Sekarang
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


