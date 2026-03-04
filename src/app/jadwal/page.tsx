"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from "lucide-react";

interface Schedule {
  date: string;
  slots: string[];
}

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
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
  return d.toISOString().split("T")[0];
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
          setSchedules(data);
        }
      } catch (err) {
        console.error(err);
      }
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

  const weekLabel = `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold glass mb-4"
              style={{ color: "#5D688A", border: "1px solid rgba(247,165,165,0.4)" }}>
              <CalendarDays className="w-3.5 h-3.5" />
              Jadwal Praktik
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3a3f52]">
              Jadwal Praktik Mingguan
            </h1>
            <p className="mt-3 text-[#5D688A]/65">
              Lihat ketersediaan jadwal drg. Bunga Maureen
            </p>
          </div>

          {/* Week Navigation */}
          <div className="glass flex items-center justify-between mb-6 rounded-2xl p-4"
            style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 4px 20px rgba(93,104,138,0.08)" }}>
            <button onClick={prevWeek}
              className="p-2 rounded-xl transition-all hover:bg-white/60 text-[#5D688A]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-[#3a3f52] text-sm sm:text-base">{weekLabel}</h2>
            <button onClick={nextWeek}
              className="p-2 rounded-xl transition-all hover:bg-white/60 text-[#5D688A]">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Schedule Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-pulse"
                  style={{ border: "1px solid rgba(255,255,255,0.6)" }}>
                  <div className="h-4 rounded-lg w-16 mb-3" style={{ background: "rgba(93,104,138,0.1)" }} />
                  <div className="h-3 rounded-lg w-24 mb-4" style={{ background: "rgba(93,104,138,0.08)" }} />
                  <div className="space-y-2">
                    <div className="h-7 rounded-xl" style={{ background: "rgba(93,104,138,0.08)" }} />
                    <div className="h-7 rounded-xl" style={{ background: "rgba(93,104,138,0.06)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {schedules.map((schedule, idx) => {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + idx);
                const isToday = formatDateStr(d) === formatDateStr(new Date());
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
                        {dayNames[d.getDay()]}
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
                        {schedule.slots.map((slot) => (
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
          )}

          {/* Info */}
          <div className="mt-8 p-4 rounded-2xl glass"
            style={{ border: "1px solid rgba(247,165,165,0.3)", background: "rgba(255,219,182,0.2)" }}>
            <p className="text-sm text-[#5D688A]">
              💡 <strong>Tips:</strong> Slot yang ditampilkan adalah waktu yang masih tersedia.
              Segera lakukan booking sebelum slot diambil pasien lain!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

