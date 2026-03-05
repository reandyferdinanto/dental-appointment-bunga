"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import TeethLoader from "@/components/ui/TeethLoader";
import { ChevronLeft, ChevronRight, Clock, CalendarDays, Calendar } from "lucide-react";

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold glass mb-4"
              style={{ color: "#5D688A", border: "1px solid rgba(247,165,165,0.4)" }}>
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
          <div className="glass flex items-center justify-between mb-5 rounded-2xl p-3 sm:p-4"
            style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 4px 20px rgba(93,104,138,0.08)" }}>
            <button onClick={prevWeek}
              className="p-2.5 rounded-xl transition-all hover:bg-white/60 text-[#5D688A] tap-feedback">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="font-bold text-[#3a3f52] text-sm sm:text-base">
                {weekStart.getDate()} {monthNames[weekStart.getMonth()]} – {weekEnd.getDate()} {monthNames[weekEnd.getMonth()]}
              </h2>
              <p className="text-xs text-[#5D688A]/50">{weekEnd.getFullYear()}</p>
            </div>
            <button onClick={nextWeek}
              className="p-2.5 rounded-xl transition-all hover:bg-white/60 text-[#5D688A] tap-feedback">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

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
                    <div key={schedule.date}
                      className={`glass rounded-2xl p-4 snap-start shrink-0 w-44 transition-all ${isPast ? "opacity-50" : ""}`}
                      style={isToday ? {
                        border: "1.5px solid rgba(247,165,165,0.6)",
                        boxShadow: "0 6px 25px rgba(247,165,165,0.2)",
                        background: "rgba(255,219,182,0.25)"
                      } : {
                        border: "1px solid rgba(255,255,255,0.7)"
                      }}>
                      <div className="mb-3">
                        <p className="font-bold text-sm" style={{ color: isToday ? "#F7A5A5" : "#3a3f52" }}>
                          {dayNamesFull[d.getDay()]}
                        </p>
                        <p className="text-xs text-[#5D688A]/55">
                          {d.getDate()} {monthNames[d.getMonth()]}
                        </p>
                        {isToday && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ background: "linear-gradient(135deg, #F7A5A5, #FFDBB6)", color: "#5D688A" }}>
                            Hari ini ✨
                          </span>
                        )}
                      </div>
                      {schedule.slots.length > 0 ? (
                        <div className="space-y-1.5">
                          {schedule.slots.sort().map((slot) => (
                            <div key={slot}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                              style={{ background: "rgba(247,165,165,0.15)", color: "#5D688A", border: "1px solid rgba(247,165,165,0.25)" }}>
                              <Clock className="w-3 h-3 text-[#F7A5A5] shrink-0" />
                              {slot}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#5D688A]/35 italic">Tidak ada jadwal</p>
                      )}
                    </div>
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
                    <div key={schedule.date}
                      className={`glass rounded-2xl p-4 transition-all ${isPast ? "opacity-45" : ""}`}
                      style={isToday ? {
                        border: "1.5px solid rgba(247,165,165,0.6)",
                        boxShadow: "0 6px 25px rgba(247,165,165,0.2)",
                        background: "rgba(255,219,182,0.25)"
                      } : {
                        border: "1px solid rgba(255,255,255,0.7)"
                      }}>
                      <div className="mb-3">
                        <p className="font-bold text-sm" style={{ color: isToday ? "#F7A5A5" : "#3a3f52" }}>
                          {dayNamesShort[d.getDay()]}
                        </p>
                        <p className="text-xs text-[#5D688A]/55">
                          {d.getDate()} {monthNames[d.getMonth()]}
                        </p>
                        {isToday && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-white text-[9px] font-bold"
                            style={{ background: "linear-gradient(135deg, #F7A5A5, #FFDBB6)", color: "#5D688A" }}>
                            Hari ini ✨
                          </span>
                        )}
                      </div>
                      {schedule.slots.length > 0 ? (
                        <div className="space-y-1.5">
                          {schedule.slots.sort().map((slot) => (
                            <div key={slot}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                              style={{ background: "rgba(247,165,165,0.15)", color: "#5D688A", border: "1px solid rgba(247,165,165,0.25)" }}>
                              <Clock className="w-3 h-3 text-[#F7A5A5]" />
                              {slot}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#5D688A]/40 italic">Tidak ada jadwal</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Info + CTA */}
          <div className="mt-6 space-y-3">
            <div className="p-4 rounded-2xl glass"
              style={{ border: "1px solid rgba(247,165,165,0.3)", background: "rgba(255,219,182,0.2)" }}>
              <p className="text-sm text-[#5D688A]">
                💡 <strong>Tips:</strong> Slot yang ditampilkan adalah waktu yang masih tersedia.
                Segera lakukan booking sebelum slot diambil pasien lain!
              </p>
            </div>
            <Link href="/booking"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-95 tap-feedback"
              style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.3)" }}>
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

